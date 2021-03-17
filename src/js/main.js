
const synth = {
	async init() {
		
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
