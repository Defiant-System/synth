
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
		let sprite = new Image;
		sprite.onload = () => {
			let cvs = document.createElement("canvas"),
				ctx = cvs.getContext("2d"),
				half = sprite.width / 2;
			// resize canvas
			cvs.width = sprite.width;
			cvs.height = sprite.height;
			// draw sprite on canvas
			ctx.drawImage(sprite, 0, 0);

			// ctx.globalAlpha = .5;
			ctx.globalCompositeOperation = "source-atop";
			ctx.fillStyle = Palette.color0 +"77";
			ctx.fillRect(half, 0, half, cvs.height);

			// save reference to canvas
			this.sprite = cvs;
			// render piano keyboard
			this.render(["init-render"]);
		};
		sprite.src = "~/img/piano-keys.png";

		this.keys = [];
		[...Array(Octaves)].map((i, octave) => {
			Object.keys(SpriteMatrix).map(note => {
				this.keys.push(new Key( octave, note, SpriteMatrix[note] ));
			});
		});
	},
	render(downKeys) {
		if (this._downKeys.join() === downKeys.join()) return;
		this._downKeys = downKeys;
		
		let ctx = this.ctx,
			keys = this.keys,
			sprite = this.sprite;

		keys.map(key => {
			let state = downKeys.find(keyNote => keyNote.startsWith(`${key.octave}:${key.note}:`)) ? "down" : "up";
			key.press(state);

			ctx.drawImage(sprite, ...key.serialize());
		});
	}
};
