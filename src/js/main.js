
@import "./modules/midi-parser.js";
@import "./modules/helpers.js";
@import "./modules/music.js";
@import "./modules/progress.js";
@import "./modules/score.js";
@import "./modules/keyboard.js";


const synth = {
	async init() {
		// init objects
		Progress.init();
		Score.init();
		Keyboard.init();


		defiant.shell(`fs -ur "~/midi/abba.mid"`)
			.then(file => {
				// set window title
				window.title = `Synth - ${file.result.base}`;
				
				// song note visualisation
				let notes = Music.parse(file.result);
				Score.setNotes(notes);
			});
	},
	async dispatch(event) {
		let Self = synth,
			file,
			el;
		switch (event.type) {
			// system events
			case "open.file":
				break;
			// custom events
			case "get-temp-file":
				break;
		}
	}
};

window.exports = synth;
