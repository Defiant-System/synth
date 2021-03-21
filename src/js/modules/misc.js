
const PPS = 100;
const octaveWidth = 161;
const octaveMinor = 77.5;
const Notes = "c c# d d# e f f# g g# a a# b".split(" ");


const Palette = {
	color0: "#66d",
	color1: "#7d7",
	color2: "#aaf",
	color3: "#f99",
	color4: "#6dd",
	color5: "#f90",
	color6: "#6d6",
	color7: "#e66",
};

const SpriteMatrix = {
	"c" : [ 0,   0, 48, 280, 0,   0, 23, 134 ],
	"c#": [ 144, 0, 32, 169, 15,  0, 15, 81  ], // black key
	"d" : [ 48,  0, 48, 280, 23,  0, 23, 134 ],
	"d#": [ 144, 0, 32, 169, 38,  0, 15, 81  ], // black key
	"e" : [ 96,  0, 48, 280, 46,  0, 23, 134 ],
	"f" : [ 0,   0, 48, 280, 69,  0, 23, 134 ],
	"f#": [ 144, 0, 32, 169, 84,  0, 15, 81  ], // black key
	"g" : [ 48,  0, 48, 280, 92,  0, 23, 134 ],
	"g#": [ 144, 0, 32, 169, 107, 0, 15, 81  ], // black key
	"a" : [ 48,  0, 48, 280, 115, 0, 23, 134 ],
	"a#": [ 144, 0, 32, 169, 130, 0, 15, 81  ], // black key
	"b" : [ 96,  0, 48, 280, 138, 0, 23, 134 ],
};


class Note {
	constructor(octave, note, track, time, duration) {
		this.octave = octave;
		this.note = note;
		this.track = track;
		this.time = time;
		this.duration = duration;
		this.color = Palette["color"+ track];

		this.clip = [
			SpriteMatrix[note][4] + (octave * octaveWidth),
			time * PPS,
			SpriteMatrix[note][6],
			duration * PPS
		];
	}

	inView(max, min) {
		let top = -this.clip[1],
			bottom = top - this.clip[3],
			isInView = top < max && top > min || bottom < max && bottom > min;
		return isInView;
	}

	flip(songHeight) {
		this.clip[1] = songHeight - this.clip[1] - this.clip[3];
	}

	add(y) {
		let clip = [...this.clip];
		clip[1] += y;
		return clip;
	}

	serialize() {
		return this.clip;
	}
};


class Key {
	constructor(octave, note, clip) {
		// sX, sY, sW, sH, dX, dY, dW, dH
		this.octave = octave;
		this.note = note;
		this.clip = [...clip];
		// offset key per octave
		this.clip[4] += octave * octaveWidth;
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

