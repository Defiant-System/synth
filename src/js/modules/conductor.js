
const Conductor = {
	init() {

	},
	play() {
		// requestAnimationFrame(Conductor.play);
	},
	prepare(file) {
		// set window title
		window.title = `Synth - ${file.base}`;

		// load & prepare midi buffer
		window.midi.load(file.buffer);

		// song note visualisation
		let song = this.parse(file.buffer);
		Score.setNotes(song);
	},
	parse(buffer) {
		let midi = MidiParser.parse(buffer);
		let sequence = [];
		let _round = Math.round,
			notes = [],
			record = {},
			timeline = [],
			tps = 60 / (120 * midi.timeDivision),
			lastTick = 0;

		// parse tracks
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

		// iterate sequence
		sequence.map(item => {
			let noteNumber = item.data[0];
			let event = record[noteNumber];

			if (item.data[1] === 0 && event) {
				// note events
				let t1 = _round(item.tick / 10),
					t2 = _round(event.tick / 10),
					h = t1 - t2;
				notes.push(new Note(event.octave, event.note, event.track, -t2-h, h));

				// calculate duration
				timeline[event.index-1].duration = (item.tick - event.tick) * tps * 1000;

				// note off
				delete record[noteNumber];

			} else if (item.data[1] > 0) {
				let octave = _round(noteNumber / 12) - 2,
					note = Notes[noteNumber % 12],
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

		let duration = sequence[sequence.length-1].tick * tps;

		return { notes, duration };
	}
};
