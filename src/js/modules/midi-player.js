
const MidiPlayer = {
	async init() {
		if (!this.player_) {
			await this.getLib_();
		}
	},
	async getLib_() {
		let mfa = await $.fetch_("~/js/midi-fur-alles.new.js");

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
	async play(path, loop) {
		if (!this.player_) {
			await this.getLib_();
		}
		if (path) {
			this.player_.pause();
			this.player_.seek(0);
			this.player_.load(path);
		}
		this.player_.play(loop);
	},
	pause() {
		this.player_.pause();
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
	get time()     {
		return this.player_.currentTime;
	},
	get duration() {
		return this.player_.currentTime;
	},
	get playing()  {
		return this.player_.playing;
	}
};
