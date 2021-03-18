
const Music = {
	init() {
		
	},
	parse(file) {
		let midi = MidiParser.parse(file.buffer);
		let sequence = [];

		// load & prepare midi buffer
		// window.midi.load(file.buffer)
		// 	.then(song => console.log(song));

		// console.log(midi);

		midi.track.map((track, i) => {
			let tick = 0;

			track.event.map((event, j) => {
				tick += event.deltaTime;
				event.track = i;
				event.tick = tick;
				sequence.push(event);
			});
		});

		// remove non-note events
		sequence = sequence.filter(item => ~[8, 9].indexOf(item.type));

		// make sure sequence is sorted
		sequence = sequence.sort((a, b) => a.tick - b.tick);

		let notes = [],
			record = {},
			timeline = [],
			tps = (60 / (120 * midi.timeDivision)),
			lastTick = 0;

		sequence.map(item => {
			let noteNumber = item.data[0];
			let event = record[noteNumber];

			if (item.data[1] === 0 && event) {
				// note off
				let top = Math.round(event.tick / 10);
				let height = Math.round(item.tick / 10) - top;

				notes.push(new Note(event.octave, event.note, event.track, top, height));

				// calculate duration
				timeline[event.index-1].duration = (item.tick - event.tick) * tps * 1000;

				// note off
				delete record[noteNumber];

			} else if (item.data[1] > 0) {
				let octave = parseInt(noteNumber / 12, 10) - 2;
				let note = Notes[noteNumber % 12];
				let index = timeline.push({
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

		let duration = sequence[sequence.length-1].tick * tps;

		return { notes, duration };
	}
};
