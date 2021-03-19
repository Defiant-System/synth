
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
		// Score.setNotes(this.song);
	},
	getPressedKeysAt(time) {
		// let keys = ["2:c", "2:e", "2:g"];
		let keys = [];

		this.song.notes.map(note => {
			if (note.time < time && note.time + note.duration > time) {
				keys.push(`${note.octave}:${note.note}`);
			}
		});

		return keys;
	},
	parse(buffer) {
		let midi = MidiParser.parse(buffer),
			sequence = [],
			notes = [],
			record = {},
			// ticks per second
			tps = 60 / (120 * midi.timeDivision),
			lastTick = 0;

		// put all notes into one sequence array
		midi.track.map((track, i) => {
			let tick = 0;
			track.event.map((event, j) => {
				tick += event.deltaTime;
				sequence.push({ ...event, tick, track: i });
			});
		});

		// remove non-note events
		sequence = sequence.filter(event => [8, 9].includes(event.type));

		// make sure sequence is sorted timewise
		sequence = sequence.sort((a, b) => a.tick - b.tick);
		// sequence = sequence.slice(0, 50);

		// iterate sequence
		sequence.map(event => {
			let [ nr, velocity ] = event.data;
			let down = record[nr];

			if (down && velocity === 0) { // key up
				let time = down.tick * tps,
					duration = (event.tick - down.tick) * tps;
				// add entry to notes
				notes.push(new Note(down.octave, down.note, down.track, time, duration));
				// delete reference to key
				record[nr] = false;

			} else if (velocity > 0) { // key down
				let octave = Math.round(nr / 12) - 2,
					note = Notes[nr % 12];
				// note on
				record[nr] = { ...event, octave, note };
				// keep track of last tick
				lastTick = event.tick;
			}
		});

		return { notes, duration: sequence[sequence.length-1].tick * tps };
	}
};
