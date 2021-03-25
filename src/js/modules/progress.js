
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
	render(time, duration) {
		let dimWidth = this.dim.width;
		let played = (time / duration) * dimWidth;

		let seconds = Math.round(time % 60);
		let minutes = Math.floor(time / 60);
		let secondsPlayed = `${minutes}:${(seconds).toString().padStart(2, "0")}`;
		
		seconds = Math.round(duration % 60);
		minutes = Math.floor(duration / 60);
		let secondsTotal = `${minutes}:${(seconds).toString().padStart(2, "0")}`;

		this.ctx.fillStyle = this.gradient;
		this.ctx.fillRect(0, 0, dimWidth, this.dim.height);

		this.ctx.save();
		this.ctx.globalCompositeOperation = "lighten";
		this.ctx.globalAlpha = .25;
		this.ctx.fillStyle = "#00ff00";
		this.ctx.fillRect(0, 0, played, this.dim.height);
		this.ctx.restore();

		this.ctx.shadowOffsetY = 1;
		this.ctx.shadowBlur = 1;
		this.ctx.shadowColor = "rgba(0,0,0,.5)";
		this.ctx.fillStyle = "#ffffff";
		this.ctx.font = "13px sans-serif";
		this.ctx.textAlign = "left";
		this.ctx.fillText(secondsPlayed, 7, 14);

		this.ctx.textAlign = "right";
		this.ctx.fillText(secondsTotal, dimWidth - 7, 14);
	}
};
