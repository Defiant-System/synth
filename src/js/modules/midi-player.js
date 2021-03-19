
const MidiPlayer = {
	async init() {
		let mfa = await $.fetch_("~/js/midi-fur-alles.new.js");

		this.player_ = new mfa({
			baseUrl: "~/js/",
			instruments: "/cdn/midi/old-freepats/"
		});
	},
	load(buffer) {
		this.player_.pause();
		this.player_.seek(0);
		this.player_.load(buffer);
	},
	play() {
		this.player_.play();
	},
	pause() {
		this.player_.pause();
	},
	on() {
		this.player_.on(event, callback);
	},
	off() {
		this.player_.off(event, callback);
	},
	once() {
		this.player_.once(event, callback);
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
