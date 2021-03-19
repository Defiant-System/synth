
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
		
		// progress bar
		window.midi.on("timeupdate", event => {
			console.log(event);
			// let min = Math.floor(event.detail / 60),
			// 	sec = Math.round(event.detail % 60),
			// 	dMin = Math.floor(songDuration / 60),
			// 	dSec = Math.round(songDuration % 60);
			// console.log("duration", window.midi.duration);
		});

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
					window.midi.pause();
				} else {
					window.midi.play();
				}

				return !isOn;
		}
	}
};

window.exports = synth;
