
const Keyboard = {
	init() {
		// fast references
		this.cvs = window.find(".keyboard canvas");
		this.ctx = this.cvs[0].getContext("2d");
		// set canvas dimensions
		this.cvs.prop({
			width: this.cvs.prop("offsetWidth"),
 			height: this.cvs.prop("offsetHeight")
		});

		// defaults
		this._downKeys = [];

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
	},
	press(downKeys) {
		if (this._downKeys.join() === downKeys.join()) return;
		this._downKeys = downKeys;

		this.keys.map(key => {
			let state = downKeys.find(keyNote => keyNote.startsWith(`${key.octave}:${key.note}:`)) ? "down" : "up";
			key.press(state)
		});

		this.render();
	},
	render() {
		let ctx = this.ctx,
			sprite = this.sprite;

		this.keys.map(key => {
			let params = [sprite, ...key.serialize()];
			ctx.drawImage(...params);
		});
	}
};
