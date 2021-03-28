
@import "./modules/replayer.js";
@import "./modules/midi-parser.js";
@import "./modules/misc.js";
@import "./modules/conductor.js";
@import "./modules/progress.js";
@import "./modules/score.js";
@import "./modules/keyboard.js";


const synth = {
	async init() {
		// init objects
		Keyboard.init();
		Progress.init();
		Score.init();
		await window.midi.init();
		await Conductor.init();

		// auto select reverb
		this.dispatch({ type: "select-reverb", arg: "cathedral" });
		// auto select song
		// this.dispatch({ type: "select-song", arg: "~/midi/Satie - The 3 Gymnopedies.mid" });
		// this.dispatch({ type: "select-song", arg: "~/midi/SW - Cantina Band.mid" });
		// this.dispatch({ type: "select-song", arg: "~/midi/Game of Thrones.mid" });
		// this.dispatch({ type: "select-song", arg: "~/midi/Salieri - Welcome March.mid" });
		// this.dispatch({ type: "select-song", arg: "Frederic Chopin - Nocturne 01.mid" });

		// setTimeout(() =>
		// 	window.find(".toolbar-tool_[data-click='toggle-song']").trigger("click"), 400);
	},
	async dispatch(event) {
		let Self = synth,
			file,
			path,
			isOn,
			el;
		switch (event.type) {
			// system events
			case "open.file":
				break;
			// custom events
			case "midi-seek":
				window.midi.seek(event.arg / 100);
				break;
			case "midi-volume":
				window.midi.volume(event.arg / 100);
				break;
			case "select-reverb":
				window.midi.reverb(event.arg);
				break;
			case "select-song":
				// load midi file
				path = event.arg.startsWith("~/midi/") ? event.arg : `/cdn/midi/music/${event.arg}`;
				file = await defiant.shell(`fs -ur "${path}"`);
				Conductor.prepare(file.result);
				break;
			case "toggle-song":
				isOn = window.midi.playing;

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
