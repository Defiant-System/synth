
const Conductor = {
	init() {

	},
	play() {
		// play midi
		window.midi.play();

		// listen to events
		// window.midi.once("ended", event => console.log("Song has finished playing!"));

		// check updates
		Conductor.update();
	},
	pause() {
		// pause midi
		window.midi.pause();
		// prevent further updates
		cancelAnimationFrame(Conductor.update);
	},
	update() {
		let time = window.midi.time;
		// progress bar
		Progress.render(time / Conductor.song.duration);
		// keyboard
		let downKeys = Conductor.getPressedKeysAt(time);
		Keyboard.press(downKeys);

		if (!window.midi.playing) return;
		requestAnimationFrame(Conductor.update);
	},
	prepare(file) {
		// set window title
		window.title = `Synth - ${file.base}`;
		// load & prepare midi buffer
		window.midi.load(file.buffer);
		// song note visualisation
		this.song = this.parse(file.buffer);
		Score.setNotes(this.song);
	},
	getPressedKeysAt(time) {
		let keys = ["2:c", "2:e", "2:g"];

		// this.song.notes

		return keys;
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

		console.log(timeline);

		let duration = sequence[sequence.length-1].tick * tps;

		return { notes, duration };
	}
};
