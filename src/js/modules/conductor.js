
const Conductor = {
	time: 0,
	timeShift: 0,
	init() {

	},
	prepare(file) {
		// set window title
		let name = file.base.split(".")[0].toUpperCase();
		window.title = `Synth <i class="icon-heart"></i> ${name}`;

		// stop any playing song
		MidiPlayer.pause();

		// load & prepare midi buffer
		MidiPlayer.load(file.buffer);

		// song note visualisation
		let midi = MidiParser.parse(file.buffer);

		switch (file.base) {
			case "abba.mid":
				midi.bpm = 120;
				midi.timeShift = 350;
				midi.topShift = 35;
				break;
			case "albeniz.mid":
				midi.bpm = 117;
				midi.timeShift = -600;
				midi.topShift = -60;
				break;
			case "cabeza.mid":
				midi.bpm = 58;
				midi.timeShift = 250;
				midi.topShift = 25;
				break;
			case "chopin.mid":
				midi.bpm = 116;
				midi.timeShift = -1300;
				midi.topShift = -130;
				break;
			case "havana.mid":
				midi.bpm = 105;
				midi.timeShift = 350;
				midi.topShift = 35;
				break;
		}

		this.song = Replayer.parse(midi);

		// console.log(this.song);
		Score.setTimeline(this.song);
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
