
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

		this.guideLines = [];
		[...Array(6)].map((i, octave) => {
			this.guideLines.push({ x: -.5 + (octave * 182),  color: "#404040" });
			this.guideLines.push({ x: 77.5 + (octave * 182), color: "#383838" });
		});

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
	}
};
