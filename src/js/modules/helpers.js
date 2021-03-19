
const octaveWidth = 182;
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


const Matrix = {
	"c" : [ 0,   0, 48, 280, 0,   0, 26, 151 ],
	"c#": [ 144, 0, 32, 169, 17,  0, 17, 92  ], // black key
	"d" : [ 48,  0, 48, 280, 26,  0, 26, 151 ],
	"d#": [ 144, 0, 32, 169, 43,  0, 17, 92  ], // black key
	"e" : [ 96,  0, 48, 280, 52,  0, 26, 151 ],
	"f" : [ 0,   0, 48, 280, 78,  0, 26, 151 ],
	"f#": [ 144, 0, 32, 169, 95,  0, 17, 92  ], // black key
	"g" : [ 48,  0, 48, 280, 104, 0, 26, 151 ],
	"g#": [ 144, 0, 32, 169, 121, 0, 17, 92  ], // black key
	"a" : [ 48,  0, 48, 280, 130, 0, 26, 151 ],
	"a#": [ 144, 0, 32, 169, 147, 0, 17, 92  ], // black key
	"b" : [ 96,  0, 48, 280, 156, 0, 26, 151 ],
};


class Note {
	constructor(octave, note, track, time, duration) {
		this.octave = octave;
		this.note = note;
		this.track = track;
		this.time = time;
		this.duration = duration;

		this.clip = [
			Matrix[note][4] + (octave * octaveWidth),
			time,
			Matrix[note][6],
			duration
		];
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

