
const Matrix = [
	// white keys
	{ note: "c",  clip: [ 0,   0, 48, 280, 0,   0, 26, 151 ] },
	{ note: "c#", clip: [ 144, 0, 32, 169, 17,  0, 17, 92  ] }, // black key
	{ note: "d",  clip: [ 48,  0, 48, 280, 26,  0, 26, 151 ] },
	{ note: "d#", clip: [ 144, 0, 32, 169, 43,  0, 17, 92  ] }, // black key
	{ note: "d",  clip: [ 96,  0, 48, 280, 52,  0, 26, 151 ] },
	{ note: "f",  clip: [ 0,   0, 48, 280, 78,  0, 26, 151 ] },
	{ note: "f#", clip: [ 144, 0, 32, 169, 95,  0, 17, 92  ] }, // black key
	{ note: "g",  clip: [ 48,  0, 48, 280, 104, 0, 26, 151 ] },
	{ note: "g#", clip: [ 144, 0, 32, 169, 121, 0, 17, 92  ] }, // black key
	{ note: "a",  clip: [ 48,  0, 48, 280, 130, 0, 26, 151 ] },
	{ note: "a#", clip: [ 144, 0, 32, 169, 147, 0, 17, 92  ] }, // black key
	{ note: "b",  clip: [ 96,  0, 48, 280, 156, 0, 26, 151 ] },
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

	press(state) {
		this.state = state;
	}

	serialize() {
		let clip = [...this.clip];

		// move clip area
		if (this.state === "down") clip[0] += 176;
		
		return clip;
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

		// this.keys[16].press("down");
	},
	render() {
		let sprite = this.sprite;

		this.keys.map(key => {
			let params = [sprite].concat(key.serialize());
			this.ctx.drawImage(...params);
		});
	}
};
