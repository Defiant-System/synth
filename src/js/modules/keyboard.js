
const Keyboard = {
	init() {
		this.cvs = window.find(".keyboard canvas");
		this.ctx = this.cvs[0].getContext("2d");
		// set canvas dimensions
		this.cvs.prop({
			width: this.cvs.prop("offsetWidth"),
 			height: this.cvs.prop("offsetHeight")
		});

		// image sprite
		this.sprite = new Image;
		this.sprite.onload = () => this.render();
		this.sprite.src = "~/img/piano-keys.png";

		this.keys = [];
		[...Array(6)].map((i, octave) => {
			Object.keys(Matrix).map(note => {
				this.keys.push(new Key( octave, note, Matrix[note] ));
			});
		});

		// this.keys[16].press("down");
	},
	press(downKeys) {
		this.keys.map(key => {
			let state = downKeys.includes(`${key.octave}:${key.note}`) ? "down" : "up";
			key.press(state)
		});
		this.render();
	},
	render() {
		let sprite = this.sprite;

		this.keys.map(key => {
			let params = [sprite].concat(key.serialize());
			this.ctx.drawImage(...params);
		});
	}
};
