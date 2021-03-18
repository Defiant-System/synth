
const Music = {
	init() {
		
	},
	parse(file) {
		let midi = MidiParser.parse(file.buffer);
		let sequence = [];

		// console.log(midi);

		midi.track.map((track, i) => {
			let tick = 0;

			track.event.map((event, j) => {
				tick += event.delta;
				event.track = i;
				event.tick = tick;
				sequence.push(event);
			});
		});

		// remove non-note events
		sequence = sequence.filter(item => ~[8, 9].indexOf(item.type));

		// make sure sequence is sorted
		sequence = sequence.sort((a, b) => a.tick - b.tick);

		let score = [],
			record = {},
			timeline = [],
			tps = (60 / (120 * midi.timeDivision)),
			lastTick = 0;

		sequence.map(item => {
			let noteNumber = item.data[0],
				event = record[noteNumber],
				octave,
				bottom,
				height,
				index,
				note;

			if (item.data[1] === 0 && event) {
				// note off
				bottom = Math.round(event.tick / 10);
				height = Math.round(item.tick / 10) - bottom;

				// console.log(event);
				//score.push(new Note(event.octave, event.note, event.track, bottom, height));

				// calculate duration
				timeline[event.index-1].duration = (item.tick - event.tick) * tps * 1000;

				// note off
				delete record[noteNumber];

			} else if (item.data[1] > 0) {
				octave = parseInt(noteNumber / 12, 10) - 1;
				note = Notes[noteNumber % 12];
				

				index = timeline.push({
					track: item.track,
					tick: item.tick,
					delta: (item.tick - lastTick) * tps * 1000,
				});

				// note on
				record[noteNumber] = {
					...item,
					octave,
					note,
					index,
				};

				lastTick = item.tick;
			}
		});

		let songDuration = sequence[sequence.length-1].tick * tps;


		// return [
		// 	new Note(2, "c", 1, 100, 40),
		// 	new Note(2, "d#", 2, 100, 40),
		// 	new Note(2, "g", 3, 100, 40),
		// 	new Note(3, "g", 2, 140, 10),
		// ];

		return score;
	}
};
