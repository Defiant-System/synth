
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
	async play(opt={}) {
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
	_buffers: {},
	async reverb(name) {
		let buffer = this._buffers[name];
		if (name && !buffer) {
			let arrayBuffer = await window.fetch(name, { responseType: "arrayBuffer" });
			buffer = await this.player_._audioContext.decodeAudioData(arrayBuffer);
			// save buffer
			this._buffers[name] = buffer;
		}
		this.player_.reverb(buffer);
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
		return this.player_._playing;
	}
};
