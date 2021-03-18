
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
			this.guideLines.push({ color: "#404040", x: -.5         + (octave * octaveWidth) });
			this.guideLines.push({ color: "#383838", x: octaveMinor + (octave * octaveWidth) });
		});
	},
	setNotes(song) {
		this.notes = song.notes;
		this.render(-250);
	},
	render(top) {
		// guide lines
		this.guideLines.map(line => {
			this.ctx.strokeStyle = line.color;
			this.ctx.beginPath();
			this.ctx.moveTo(line.x, 0);
			this.ctx.lineTo(line.x, this.dim.height);
			this.ctx.stroke();
		});

		// console.log( this.notes.slice(0, 10) );

		this.notes.map(note => {
			let params = note.serialize(),
				y = params[1],
				h = y + params[3];

			// border radius
			params.push(4);

			this.ctx.shadowOffsetY = 2;
			this.ctx.shadowBlur = 2;
			this.ctx.shadowColor = "rgba(0,0,0,.25)";
			this.ctx.strokeStyle = "rgba(0,0,0,.35)";
			this.ctx.fillStyle = Palette["color"+ note.track];
			this.ctx.beginPath();
			this.ctx.roundRect(...params);
			this.ctx.fill();
			this.ctx.stroke();

			let gradient = this.ctx.createLinearGradient(0, y, 0, h);
			gradient.addColorStop(0.0, "rgba(0,0,0,0)");
			gradient.addColorStop(1.0, "rgba(0,0,0,.35)");

			this.ctx.beginPath();
			this.ctx.fillStyle = gradient;
			this.ctx.roundRect(...params);
			this.ctx.fill();
		});
	}
};
