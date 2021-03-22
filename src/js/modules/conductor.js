
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

		this.song.timeline.map(note => {
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

		return song;
	}
};
