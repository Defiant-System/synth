
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

		// auto select reverb
		// this.dispatch({ type: "select-reverb", arg: "~/js/ir-large-hall.ogg" });
		// auto select song
		this.dispatch({ type: "select-song", arg: "~/midi/abba.mid" });
	},
	async dispatch(event) {
		let Self = synth,
			file,
			isOn,
			el;
		switch (event.type) {
			// system events
			case "open.file":
				break;
			// custom events
			case "midi-seek":
				MidiPlayer.seek(event.arg / 100);
				break;
			case "midi-volume":
				MidiPlayer.volume(event.arg / 100);
				break;
			case "select-reverb":
				MidiPlayer.reverb(event.arg);
				break;
			case "select-song":
				// load midi file
				file = await defiant.shell(`fs -ur "${event.arg}"`);
				Conductor.prepare(file.result);
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
