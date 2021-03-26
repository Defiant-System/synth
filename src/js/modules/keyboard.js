
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
				colors = Object.keys(Palette);

			// resize canvas
			cvs.width = SpriteHalf + (colors.length * SpriteHalf);
			cvs.height = sprite.height;
			// draw sprite on canvas
			ctx.drawImage(sprite, 0, 0);

			colors.map((key, i) => {
				ctx.drawImage(sprite, SpriteHalf, 0, SpriteHalf, sprite.height,
									(SpriteHalf * (i + 1)), 0, SpriteHalf, sprite.height);
			});

			// colorize down keys
			colors.map((key, i) => {
				ctx.globalCompositeOperation = "source-atop";
				ctx.fillStyle = Palette[key] +"aa";
				ctx.fillRect(SpriteHalf * (i + 1), 0, SpriteHalf, cvs.height);
			});

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
		// logic to avoid painting the keyboard aunnecessarily times
		if (this._downKeys.join() === downKeys.join()) return;
		this._downKeys = downKeys;
		
		let ctx = this.ctx,
			keys = this.keys,
			sprite = this.sprite,
			ignite = [];

		keys.map(key => {
			let cKey = downKeys.find(keyNote => keyNote.startsWith(`${key.octave}:${key.note}:`)),
				args = cKey ? cKey.split(":") : undefined,
				track = cKey ? +args[2] : undefined,
				state = cKey ? "down" : "up",
				currentState = key.state;

			key.press(state, track);

			let dim = key.serialize()
			if (cKey) {
				ignite.push({ track, state, left: +dim[4], top: +args[4], width: +args[5] });
			} else if (state !== currentState) {
				ignite.push({ state, left: +dim[4] + 1 });
			}

			ctx.drawImage(sprite, ...dim);
		});

		return ignite;
	}
};
