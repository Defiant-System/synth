
const Conductor = {
	time: false,
	init() {

	},
	play() {
		// play midi
		MidiPlayer.play({
			loop: false,
			syncCallback() {
				console.log("playing...");

				// tilting timer a little bit
				Conductor.time = Date.now() + 300;

				// start sync'ed
				Conductor.update();
			}
		});
	},
	pause() {
		// pause midi
		MidiPlayer.pause();
		
		// prevent further updates
		cancelAnimationFrame(Conductor.update);
	},
	update() {
		let time = (Date.now() - Conductor.time) / 1000,
			duration = MidiPlayer.duration;
		
		// progress bar
		Progress.render(time / duration);

		// keyboard
		let downKeys = Conductor.getPressedKeysAt(time);
		Keyboard.press(downKeys);

		// Score scroll
		Score.render((time - duration) * 60);

		if (!MidiPlayer.playing) return;
		requestAnimationFrame(Conductor.update);
	},
	prepare(file) {
		// set window title
		window.title = `Synth - ${file.base}`;
		
		// stop any playing song
		MidiPlayer.pause();

		// load & prepare midi buffer
		MidiPlayer.load(file.buffer);

		// song note visualisation
		this.song = this.parse(file.buffer);
		Score.setNotes(this.song);
	},
	getPressedKeysAt(time) {
		let keys = [];

		this.song.notes.map(note => {
			if (note.time < time && note.time + note.duration > time) {
				keys.push(`${note.octave}:${note.note}:${note.color}`);
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
