
const Progress = {
	init() {
		this.cvs = window.find(".progress canvas");
		this.ctx = this.cvs[0].getContext("2d");
		this.dim = {
			width: this.cvs.prop("offsetWidth"),
			height: this.cvs.prop("offsetHeight"),
		};
		// set canvas dimensions
		this.cvs.prop(this.dim);

		this.gradient = this.ctx.createLinearGradient(0, 0, 0, this.dim.height);
		this.gradient.addColorStop(0.0,   "#646464");
		this.gradient.addColorStop(0.25,  "#4d4d4d");
		this.gradient.addColorStop(0.499, "#3a3a3a");
		this.gradient.addColorStop(0.5,   "#2a2a2a");
		this.gradient.addColorStop(0.75,  "#2a2a2a");
		this.gradient.addColorStop(1.0,   "#353535");

		// reset progress bar
		this.render(0);
	},
	render(percentage) {
		this.ctx.fillStyle = this.gradient;
		this.ctx.fillRect(0, 0, this.dim.width, this.dim.height);

		let width = percentage * this.dim.width;

		this.ctx.save();
		this.ctx.globalCompositeOperation = "lighten";
		this.ctx.globalAlpha = .25;
		this.ctx.fillStyle = "#00ff00";
		this.ctx.fillRect(0, 0, width, this.dim.height);
		this.ctx.restore();
	}
};
