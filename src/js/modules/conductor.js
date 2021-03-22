
const Conductor = {
	time: 0,
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
		let midi = MidiParser.parse(file.buffer);
		this.song = Replayer.parse(midi, 1, 120);
		Score.setTimeline(this.song);
	},
	play() {
		// play midi
		MidiPlayer.play({
			loop: false,
			syncCallback(time) {
				// tilting timer a little bit
				if (!Conductor.time) Conductor.time = Date.now() + 350;

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
			duration = this.song.duration;
		
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

		this.song.timeline.map(note => {
			if (note.time < time && note.time + note.duration > time) {
				keys.push(`${note.octave}:${note.note}:${note.track}`);
			}
		});

		return keys;
	}
};
