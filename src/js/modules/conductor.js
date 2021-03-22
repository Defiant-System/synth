
const Conductor = {
	time: false,
	init() {

	},
	prepare(file) {
		// set window title
		window.title = `Synth <i class="icon-heart"></i> ${file.base}`;
		
		// stop any playing song
		MidiPlayer.pause();

		// load & prepare midi buffer
		MidiPlayer.load(file.buffer);

		// song note visualisation
		this.song = this.parse(file.buffer);
		Score.setTimeline(this.song);
	},
	play() {
		// play midi
		MidiPlayer.play({
			loop: false,
			syncCallback() {
				console.log("playing...");

				// tilting timer a little bit
				Conductor.time = Date.now() + 250;

				// start sync'ed
				Conductor.update();
			}
		});
	},
	pause() {
		// pause midi
		MidiPlayer.pause();
		
		// prevent further updates
		cancelAnimationFrame(Conductor._rafID);
		Conductor._rafID = undefined;
	},
	update() {
		let time = (Date.now() - this.time) / 1000,
			duration = MidiPlayer.duration;
		
		// progress bar
		Progress.render(time / duration);

		// keyboard
		let downKeys = this.getPressedKeysAt(time);
		Keyboard.render(downKeys);

		// Score scroll
		Score.render((time - duration) * PPS);

		if (!MidiPlayer.playing) return;
		this._rafID = requestAnimationFrame(this.update.bind(this));
	},
	getPressedKeysAt(time) {
		let keys = [];

		this.song.notes.map(note => {
			if (note.time < time && note.time + note.duration > time) {
				keys.push(`${note.octave}:${note.note}:${note.track}`);
			}
		});

		return keys;
	},
	parse(buffer) {
		let midiFile = MidiParser.parse(buffer);
		let song = Replayer.parse(midiFile, 1, 120);
		// console.log(song);

		// let test = this.parse2(buffer);
		// console.log(test);

		return song;
	},
	parse2(buffer) {
		let midi = MidiParser.parse(buffer),
			sequence = [],
			timeline = [],
			record = {},
			// ticks per second
			tps = 60 / (120 * midi.timeDivision),
			lastTick = 0,
			song = {};

		// put all notes into one sequence array
		midi.track.map((track, i) => {
			let tick = 0;
			track.event.map((event, j) => {
				tick += event.deltaTime;
				sequence.push({ ...event, tick, track: i });
			});
		});

		// collect info
		sequence.map(event => {
			if (![8, 9].includes(event.type)) {
				switch (event.metaType) {
					case 0x2f: // endOfTrack
						song.totalTicks = Math.max(song.totalTicks || 0, event.tick);
						break;
					case 0x51: // setTempo
						break;
				}
			}
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
				timeline.push(new Note(down.octave, down.note, down.track, time, duration));
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

		return { timeline, end: sequence[sequence.length-1].tick * tps };
	}
};
