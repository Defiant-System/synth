
const PPS = 150;
const Octaves = 7;
const OctaveWidth = 161;
const OctaveMinor = 68.5;
const SpriteHalf = 176;
const Notes = "c c# d d# e f f# g g# a a# b".split(" ");


const Palette = {
	"color-0": "#77bb77",
	"color-1": "#aa88ff",
	"color-2": "#4477cc",
	"color-3": "#ff9999",
	"color-4": "#66dddd",
	"color-5": "#ff9900",
	"color-6": "#66dd60",
	"color-7": "#ee3333",
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
		this.time = time / 1000; // trasnlate from ms to seconds
		this.duration = duration / 1000;
		this.color = Palette["color-"+ track];

		this.clip = [
			SpriteMatrix[note][4] + (octave * OctaveWidth),
			this.time * PPS,
			SpriteMatrix[note][6],
			this.duration * PPS
		];
	}

	flipVerticaly(songHeight) {
		this.clip[1] = songHeight - this.clip[1] - this.clip[3];
	}

	addTop(y) {
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
		this.clip[4] += octave * OctaveWidth;
	}

	press(state, track) {
		this.state = state;
		this.track = track;
	}

	serialize() {
		let clip = [...this.clip];

		// move clip area
		if (this.state === "down") {
			clip[0] += SpriteHalf + (this.track * SpriteHalf);

			clip[0] += 1;
			clip[2] -= 2;
			clip[3] -= 1;

			clip[4] += 1;
			clip[6] -= 2;
			clip[7] -= 1;
		}

		return clip;
	}
};

