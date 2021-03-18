
class Note {
	constructor(octave, note, track, tick, duration) {
		this.octave = octave;
		this.note = note;
		this.track = track;
		this.tick = tick;
		this.duration = duration;
	}

	serialize() {

	}
};


const Score = {
	init() {
		this.cvs = window.find(".score canvas");
		this.ctx = this.cvs[0].getContext("2d");
		this.dim = {
			width: this.cvs.prop("offsetWidth"),
			height: this.cvs.prop("offsetHeight")
		};
		// set canvas dimensions
		this.cvs.prop(this.dim);

		// guide lines
		this.guideLines = [];
		[...Array(6)].map((i, octave) => {
			this.guideLines.push({ x: -.5 + (octave * 182),  color: "#404040" });
			this.guideLines.push({ x: 77.5 + (octave * 182), color: "#383838" });
		});

		this.notes = [
			new Note(2, "c", 1, 100, 40),
		];

		this.render();
	},
	render() {
		this.guideLines.map(line => {
			this.ctx.strokeStyle = line.color;
			this.ctx.beginPath();
			this.ctx.moveTo(line.x, 0);
			this.ctx.lineTo(line.x, this.dim.height);
			this.ctx.stroke();
		});

		this.notes.map(note => {
			this.ctx.strokeStyle = "rgba(0,0,0,.35)";
			this.ctx.fillStyle = "purple";

			this.ctx.shadowOffsetY = 2;
			this.ctx.shadowBlur = 2;
			this.ctx.shadowColor = "rgba(0,0,0,.25)";

			this.ctx.beginPath();
			this.ctx.roundRect(100, 100, 26, 100, 4);
			this.ctx.fill();
			this.ctx.stroke();

			let gradient = this.ctx.createLinearGradient(0, 100, 0, 200);
			gradient.addColorStop(0.0, "rgba(0,0,0,0)");
			gradient.addColorStop(1.0, "rgba(0,0,0,.35)");

			this.ctx.beginPath();
			this.ctx.fillStyle = gradient;
			this.ctx.roundRect(100, 100, 26, 100, 4);
			this.ctx.fill();
		});
	}
};
