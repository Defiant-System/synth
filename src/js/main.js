
@import "./modules/misc.js";
@import "./modules/progress.js";
@import "./modules/score.js";
@import "./modules/keyboard.js";


const synth = {
	async init() {
		// init objects
		Progress.init();
		Score.init();
		Keyboard.init();
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
