
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

		// defaults
		this._lightUp = [];

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
	render(top, notesInView=[], lightUp=[]) {
		let ctx  = this.ctx;
		let paletteColors = Palette;
		let bulbTop = this.dim.height - 4;

		// guidelines background
		ctx.putImageData(this.guideLines, 0, 0);

		// paint notes
		notesInView.map(note => {
			let params = note.addTop(top),
				y = params[1],
				h = y + params[3],
				gradient = ctx.createLinearGradient(0, y, 0, h);

			// border radius
			params.push(4);

			ctx.save();
			ctx.shadowOffsetY = 2;
			ctx.shadowBlur = 2;
			ctx.shadowColor = "rgba(0,0,0,.25)";
			ctx.strokeStyle = "rgba(0,0,0,.35)";
			ctx.fillStyle = paletteColors["color-"+ note.track];
			ctx.beginPath();
			ctx.roundRect(...params);
			ctx.fill();
			ctx.stroke();
			ctx.restore();

			// gradient
			gradient.addColorStop(0.0, "rgba(0,0,0,0)");
			gradient.addColorStop(1.0, "rgba(0,0,0,.35)");

			ctx.beginPath();
			ctx.fillStyle = gradient;
			ctx.roundRect(...params);
			ctx.fill();
		});

		
		if (!lightUp.length) lightUp = this._lightUp;
		this._lightUp = lightUp;

		ctx.save();
		// ctx.globalAlpha = .75;
		ctx.globalCompositeOperation = "lighter";

		lightUp.map(bulb => {
			let radius = bulb.width >> 1;
			let left = bulb.left + radius;
			let height = radius + 25;
			let gradient = ctx.createRadialGradient(left, bulbTop, 0, left, bulbTop, height);

			gradient.addColorStop(0.0, "rgba(255,255,255,1)");
			gradient.addColorStop(0.2, "rgba(255,255,255,.5)");
			gradient.addColorStop(0.5, "rgba(255,255,255,.02)");
			gradient.addColorStop(1.0, "rgba(255,255,255,0)");
			ctx.fillStyle = gradient;

			ctx.beginPath();
			ctx.arc(left, bulbTop, height, Math.PI, 0);
			ctx.fill();
		});

		ctx.restore();
	}
};
