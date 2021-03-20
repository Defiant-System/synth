
@import "./modules/midi-player.js";

@import "./modules/midi-parser.js";
@import "./modules/misc.js";
@import "./modules/conductor.js";
@import "./modules/progress.js";
@import "./modules/score.js";
@import "./modules/keyboard.js";


const synth = {
	async init() {
		// init objects
		Progress.init();
		Score.init();
		Keyboard.init();
		await MidiPlayer.init();
		await Conductor.init();

		// load midi file
		let file = await defiant.shell(`fs -ur "~/midi/cabeza.mid"`);
		MidiPlayer.load(file.result.buffer);

		// Conductor.prepare(file.result);
	},
	async dispatch(event) {
		let Self = synth,
			isOn,
			el;
		switch (event.type) {
			// system events
			case "open.file":
				break;
			// custom events
			case "prev-song":
			case "next-song":
				break;
			case "toggle-song":
				isOn = MidiPlayer.playing;

				if (isOn) {
					Conductor.pause();
				} else {
					Conductor.play();
				}

				return !isOn;
		}
	}
};

window.exports = synth;
