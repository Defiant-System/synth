
@import "./modules/midi-parser.js";
@import "./modules/helpers.js";
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
		await Conductor.init();


		// pre-fetch required lib for midi
		await window.midi.init()
		
		// load midi file
		let file = await defiant.shell(`fs -ur "~/midi/abba.mid"`);
		Conductor.prepare(file.result);
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
