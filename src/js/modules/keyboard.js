
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

		// key position matrix
		this.matrix = [
			// white keys
			[ 0,  0, 48, 280, 0,   0, 26, 151 ],
			[ 48, 0, 48, 280, 26,  0, 26, 151 ],
			[ 96, 0, 48, 280, 52,  0, 26, 151 ],
			[ 0,  0, 48, 280, 78,  0, 26, 151 ],
			[ 48, 0, 48, 280, 104, 0, 26, 151 ],
			[ 48, 0, 48, 280, 130, 0, 26, 151 ],
			[ 96, 0, 48, 280, 156, 0, 26, 151 ],
			// black keys
			[ 32, 0, 32, 170, 17,  0, 17, 92  ],
			[ 32, 0, 32, 170, 43,  0, 17, 92  ],
			[ 32, 0, 32, 170, 95,  0, 17, 92  ],
			[ 32, 0, 32, 170, 121, 0, 17, 92  ],
			[ 32, 0, 32, 170, 147, 0, 17, 92  ],
		];
	},
	render() {
		let sprite = this.sprite;

		[...Array(6)].map((i, octave) => {
			console.log(octave);
		});
		this.matrix.map(key => {
			let params = [sprite].concat(key);
			this.ctx.drawImage(...params);
		});

		/*
		// white keys
		this.ctx.drawImage(sprite, 0,  0, 48, 280, 0,  0, 26, 151);
		this.ctx.drawImage(sprite, 48, 0, 48, 280, 26, 0, 26, 151);
		this.ctx.drawImage(sprite, 96, 0, 48, 280, 52, 0, 26, 151);

		this.ctx.drawImage(sprite, 0,  0, 48, 280, 78,  0, 26, 151);
		this.ctx.drawImage(sprite, 48, 0, 48, 280, 104, 0, 26, 151);
		this.ctx.drawImage(sprite, 48, 0, 48, 280, 130, 0, 26, 151);
		this.ctx.drawImage(sprite, 96, 0, 48, 280, 156, 0, 26, 151);

		// black keys
		this.ctx.drawImage(sprite, 32, 0, 32, 170, 17, 0, 17, 92);
		this.ctx.drawImage(sprite, 32, 0, 32, 170, 43, 0, 17, 92);

		this.ctx.drawImage(sprite, 32, 0, 32, 170, 95,  0, 17, 92);
		this.ctx.drawImage(sprite, 32, 0, 32, 170, 121, 0, 17, 92);
		this.ctx.drawImage(sprite, 32, 0, 32, 170, 147, 0, 17, 92);
		*/
	}
};
