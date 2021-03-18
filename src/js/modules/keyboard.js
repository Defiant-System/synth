
const Matrix = [
	// white keys
	{ note: "c",  clip: [ 0,   0, 48,  280, 0,   0, 26, 151 ] },
	{ note: "c#", clip: [ 288, 0, 32,  169, 17,  0, 17, 92  ] }, // black key
	{ note: "d",  clip: [ 48,  0, 48,  280, 26,  0, 26, 151 ] },
	{ note: "d#", clip: [ 288, 0, 32,  169, 43,  0, 17, 92  ] }, // black key
	{ note: "d",  clip: [ 96,  0, 48,  280, 52,  0, 26, 151 ] },
	{ note: "f",  clip: [ 0,   0, 48,  280, 78,  0, 26, 151 ] },
	{ note: "f#", clip: [ 288, 0, 32,  169, 95,  0, 17, 92  ] }, // black key
	{ note: "g",  clip: [ 48,  0, 48,  280, 104, 0, 26, 151 ] },
	{ note: "g#", clip: [ 288, 0, 32,  169, 121, 0, 17, 92  ] }, // black key
	{ note: "a",  clip: [ 48,  0, 48,  280, 130, 0, 26, 151 ] },
	{ note: "a#", clip: [ 288, 0, 32,  169, 147, 0, 17, 92  ] }, // black key
	{ note: "b",  clip: [ 96,  0, 48,  280, 156, 0, 26, 151 ] },
];


class Key {
	constructor(octave, note, clip) {
		// sX, sY, sW, sH, dX, dY, dW, dH
		this.octave = octave;
		this.note = note;
		this.clip = [...clip];
		// offset key per octave
		this.clip[4] += octave * 182;
	}

	serialize() {
		return this.clip;
	}
};


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
			Matrix.map(item => {
				this.keys.push(new Key( octave, item.note, item.clip ));
			});
		});
	},
	render() {
		let sprite = this.sprite;

		this.keys.map(key => {
			let params = [sprite].concat(key.serialize());
			this.ctx.drawImage(...params);
		});

		// Matrix.map(key => {
		// 	let params = [sprite].concat(key);
		// 	this.ctx.drawImage(...params);
		// });
		
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
