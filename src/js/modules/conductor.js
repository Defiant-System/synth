
const Conductor = {
	time: 0,
	timeShift: 0,
	init() {

	},
	prepare(file) {
		// set window title
		let name = file.base.split(".")[0];
		name = name.slice(0,1).toUpperCase() + name.slice(1);
		window.title = `Synth <i class="icon-heart"></i> ${name}`;

		// stop any playing song
		MidiPlayer.pause();

		// load & prepare midi buffer
		MidiPlayer.load(file.buffer);

		// song note visualisation
		let midi = MidiParser.parse(file.buffer);

		switch (file.base) {
			case "abba.mid":
				midi.timeShift = 350;	// 0
				midi.topShift = 35;
				break;
			case "albeniz.mid":
				midi.timeShift = -600;	// 1.71875
				midi.topShift = -60;
				break;
			case "cabeza.mid":
				midi.timeShift = 250;	// 0
				midi.topShift = 25;
				break;
			case "chopin.mid":
				midi.timeShift = -1250;	// 1.5517241379310345
				midi.topShift = -125;
				break;
			case "havana.mid":
				midi.timeShift = 350;	// 0
				midi.topShift = 35;
				break;
		}

		this.song = Replayer.parse(midi);
		this.song.height = this.song.duration * PPS;
		this.song.timeline.map(note => note.flipVerticaly(this.song.height));

		Score.song = this.song;

		this.update(false, -this.song.height - this.song.topShift);
	},
	play() {
		// play midi
		MidiPlayer.play({
			loop: false,
			syncCallback(time) {
				// tilting timer a little bit
				if (!Conductor.time) Conductor.time = Date.now() + Conductor.song.timeShift;

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
	update(ignore, startTop) {
		let time = (Date.now() - this.time) / 1000,
			downKeys = this.getPressedKeysAt(time),
			duration = this.song.duration,
			scoreHeight = Score.dim.height,
			top = startTop || (time - duration) * PPS,
			notesInView = this.getNotesInViewAt(top, scoreHeight);

		// progress bar
		Progress.render(this.time ? time : 0, duration);

		// keyboard
		let lightUp = Keyboard.render(downKeys);

		// Score scroll
		Score.render(top + scoreHeight, notesInView, lightUp);

		if (!MidiPlayer.playing) return;
		this._rafID = requestAnimationFrame(this.update.bind(this));
	},
	getNotesInViewAt(top, height) {
		let notes = [],
			max = top + height,
			min = top - height;
		
		this.song.timeline.map(note => {
			if (note.inView(max, min)) {
				notes.push(note);
			}
		});

		return notes;
	},
	getPressedKeysAt(time) {
		let keys = [];

		this.song.timeline.map(note => {
			if (note.time < time && note.time + note.duration > time) {
				keys.push(`${note.octave}:${note.note}:${note.track}`);
			}
		});

		return keys;
	}
};
