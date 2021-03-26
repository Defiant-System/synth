
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
		this._lights = [];

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
	render(top, notesInView=[], ignite=[]) {
		let ctx  = this.ctx;
		let paletteColors = Palette;

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


		// lights
		ignite.map(turnOn => {
			let index = this._lights.findIndex(b => b.left === turnOn.left && b.top === turnOn.top),
				bulb = index > -1 ? this._lights[index] : false;

			if (index < 0) {
				index = this._lights.findIndex(b => b.left === turnOn.left);
				bulb = index > -1 ? this._lights[index] : false;
			}

			if (turnOn.state === "down") {
				if (!bulb) this._lights.push({ ...turnOn, radius: 15 });
				else if (bulb && bulb.top !== turnOn.top) this._lights.push({ ...turnOn, radius: 15 });
			} else if (turnOn.state === "up" && bulb) {
				this._lights.splice(index, 1);
			}
		});

		let bulbTop = this.dim.height - 15;
		let pi2 = Math.PI * 2;

		ctx.fillStyle = "#fff";
		this._lights.filter(b => b.radius).map(bulb => {
			let radius = bulb.radius;
			let left = bulb.left + (bulb.width >> 1);
			
			ctx.beginPath();
			ctx.arc(left, bulbTop, radius, 0, pi2, false);
			ctx.fill();

			// reduce light radius
			bulb.radius--;
		});

		// remove all lights off
		// this._lights = this._lights.filter(b => b.radius > 0);
	}
};
