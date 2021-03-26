
const Conductor = {
	time: 0,
	viewIndex: 0,
	init() {

	},
	async prepare(file) {
		// set window title
		let name = file.base.split(".")[0];
		name = name.slice(0,1).toUpperCase() + name.slice(1);
		window.title = `Synth <i class="icon-heart"></i> ${name}`;

		// stop any playing song
		MidiPlayer.pause();

		// load & prepare midi buffer
		await MidiPlayer.load(file.buffer);

		// song note visualisation
		let midi = MidiParser.parse(file.buffer);
		this.song = Replayer.parse(midi);
		this.song.duration = MidiPlayer.duration;
		this.song.height = MidiPlayer.duration * PPS;
		this.song.timeline.map(note => note.flipVerticaly(this.song.height));

		this.update(false, -this.song.height + (this.song.timeShift * PPS));
	},
	play() {
		// play midi
		MidiPlayer.play({
			loop: false,
			syncCallback() {
				// tilting timer a little bit
				if (!Conductor.time) Conductor.time = Date.now();
				// start sync'ed
				Conductor.update();
			}
		});
	},
	pause() {
		// pause midi
		MidiPlayer.pause();

		// prevent further updates
		cancelAnimationFrame(Conductor._rafID);
		Conductor._rafID = undefined;
	},
	seek(percentage) {
		// adjust time start
		this.time = Date.now() - (this.song.duration * percentage * 1000);
		// signal midi player
		MidiPlayer.seek(percentage);
	},
	update(ignore, startTop) {
		let time = ((Date.now() - this.time) / 1000) + this.song.timeShift,
			downKeys = this.getPressedKeysAt(time),
			duration = this.song.duration,
			scoreHeight = Score.dim.height,
			top = startTop || (time - duration) * PPS,
			notesInView = this.getNotesInViewAt(top, scoreHeight);

		// progress bar
		Progress.render(this.time ? time : 0, duration);

		// keyboard
		let ignite = Keyboard.render(downKeys);

		// Score scroll
		Score.render(top + scoreHeight - 5, notesInView, ignite);

		if (!MidiPlayer.playing) return;
		this._rafID = requestAnimationFrame(this.update.bind(this));
	},
	getNotesInViewAt(top, height) {
		let vY = top,
			vH = top + height,
			timeline = this.song.timeline,
			i = this.viewIndex,
			il = timeline.length,
			indeces = [];
		// check for notes from viewIndex and exit if encounter notes outside view
		for (; i<il; i++) {
			let note = timeline[i],
				nY = -note.clip[1],
				nH = nY - note.clip[3];

			if (vY < nY && vH > nH) {
				/* note in view */
				indeces.push(i);
			} else if (vY < nY && vH < nY) {
				/* note is above view - exit loop */
				break;
			}
		}
		// update view index - less loop next time
		this.viewIndex = Math.min(...indeces);
		// console.log("span: ", this.viewIndex, i);
		// console.log("Notes in view: ", i - this.viewIndex);

		return timeline.slice(this.viewIndex, i);
	},
	getPressedKeysAt(time) {
		let keys = [];

		this.song.timeline.map(note => {
			if (note.time < time && note.time + note.duration > time) {
				keys.push(`${note.octave}:${note.note}:${note.track}:${note.clip.join(":")}`);
			}
		});

		return keys;
	}
};
