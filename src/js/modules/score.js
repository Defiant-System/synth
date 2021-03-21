
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
		let guideLines = [];
		[...Array(Octaves)].map((i, octave) => {
			guideLines.push({ color: "#404040", x: -.5         + (octave * OctaveWidth) });
			guideLines.push({ color: "#383838", x: OctaveMinor + (octave * OctaveWidth) });
		});
		// guide lines
		guideLines.map(line => {
			this.ctx.strokeStyle = line.color;
			this.ctx.beginPath();
			this.ctx.moveTo(line.x, 0);
			this.ctx.lineTo(line.x, this.dim.height);
			this.ctx.stroke();
		});
		// save guide lines background - for faster render
		this.guideLines = this.ctx.getImageData(0, 0, this.dim.width, this.dim.height);
	},
	setNotes(song) {
		this.notes = song.notes;
		this.songHeight = song.duration * PPS;
		this.notes.map(note => note.flip(this.songHeight));

		// this.render(this.dim.height - 30);
		this.render(-this.songHeight - 20);
	},
	render(top) {
		let height = this.dim.height;
		let notesInView = [];

		// considers height of view
		top += height;

		let max = top,
			min = top - height;
		this.notes.map(note => {
			if (note.inView(max, min)) {
				notesInView.push(note);
			}
		});

		// clear canvas
		this.cvs.prop({ height });

		// guidelines background
		this.ctx.putImageData(this.guideLines, 0, 0);

		// paint notes
		notesInView.map(note => {
			let params = note.add(top),
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
