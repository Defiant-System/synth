
const MidiPlayer = {
	async init() {
		if (!this.player_) {
			await this.getLib_();
		}
	},
	async getLib_() {
		let mfa = await $.fetch_("~/js/midi-fur-alles.js");

		this.player_ = new mfa({
			baseUrl: "~/js/",
			instruments: "/cdn/midi/old-freepats/",
			dispatch: this.dispatch,
		});
	},
	load(buffer) {
		this.player_.pause();
		this.player_.seek(0);
		this.player_.load(buffer);
	},
	async play(path=false) {
		let opt = {};
		if (!this.player_) {
			await this.getLib_();
		}
		if (path && path.constructor === String) {
			this.player_.pause();
			this.player_.seek(0);
			this.player_.load(path);
		} else if (path.constructor === Object) {
			opt = { ...path };
		}
		this.player_.play(opt);
	},
	pause() {
		this.player_.pause();
	},
	seek(percentage) {
		let value = this.player_.duration * percentage;
		this.player_.seek(value);
	},
	volume(value) {
		this.player_.volume(value);
	},
	dispatch(type) {
		//console.log("Midi: ", type);
		switch (type) {
			case "ready": break;
			case "buffering": break;
			case "playing": break;
			case "ended": break;
			case "paused": break;
			case "error": break;
		}
	},
	get currentTime() {
		return this.player_.currentTime;
	},
	get duration() {
		return this.player_.duration;
	},
	get playing()  {
		return this.player_.playing;
	}
};
