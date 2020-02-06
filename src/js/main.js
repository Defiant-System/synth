
import "./midi-parser.js"

const MidiParser = self.MidiParser;
const NOTES = "c c# d d# e f f# g g# a a# b".split(" ");


const synth = {
	async init() {
		// fast references
		this.score = window.find(".score .wrapper");
		this.progress = window.find(".progress");
		this.progressBar = window.find(".progress .bar");
		this.playTime = window.find(".progress .play-time");
		this.songLength = window.find(".progress .song-length");
		this.keyboard = window.find(".keyboard");

		// pre-fetch required lib for midi
		//await window.music.init();

		this.dispatch({type: "get-temp-file"});
	},
	async dispatch(event) {
		let self = synth,
			file,
			midi,
			seq,
			el;
		switch (event.type) {
			// system events
			case "open.file":
				file = await event.open();

				self.dispatch({type: "parse-file", file});
				break;
			// custom events
			case "get-temp-file":
				let request = await defiant.shell(`fs -ur "~/midi/abba.mid"`);
				file = request.result;

				self.dispatch({type: "parse-file", file});
				break;
			case "play-song":
				if (window.music.playing) {
					return window.music.pause();
				}
				break;
			case "parse-file":
				file = event.file;
				// set window title
				window.title = `Synth - ${file.name}`;

				midi = MidiParser.parse(file.buffer);
				seq = [];

				midi.track.map((track, i) => {
					let tick = 0;
					track.event.map(event => {
						tick += event.deltaTime;
						event.track = i;
						event.tick = tick;
						seq.push(event);
					});
				});
				// remove non-note events
				seq = seq.filter(item => ~[8, 9].indexOf(item.type));
				// make sure sequence is sorted
				seq = seq.sort((a, b) => a.tick - b.tick);
				// debug
				//seq.slice(0, 40).map(e => console.log(e.tick));

				let score = [],
					record = {},
					timeline = [];

				seq.map(item => {
					let note = item.data[0],
						event = record[note],
						octave,
						bottom,
						height,
						el;
					if (item.data[1] === 0 && event) {
						// note off
						octave = parseInt(note / 12, 10) - 1;
						note = NOTES[note % 12];
						bottom = Math.round(event.tick / 10);
						height = Math.round(item.tick / 10) - bottom;

						// save html to score array
						score.push(`<b note="${note}" octave="${octave}" track="${event.track}" style="bottom: ${bottom}px; height: ${height}px;"><i>${note}</i></b>`);

						// delete note event from record
						delete record[note];
					} else if (item.data[1] > 0) {
						// note on
						record[note] = { ...item };
					}
				});

				// plot score HTML
				self.score
					.css({
						height: (16000 * 100) +"px",
						transform: `translateY(${-(16000 * 100) + 442}px)`,
					})
					.html(score.join(""));
				break;
		}
	},
	playback() {
		let event = this.timeline.shift(),
			className = "active track-"+ event.track,
			duration = Math.max(event.duration, 80);
		
		event.el
			.prop({ style: `--duration: ${duration}ms;` })
			//.prop({ style: `--duration: 100ms` })
			.cssSequence(className, "transitionend", el => el.removeClass(className).prop({ style: "" }));

		if (this.timeline.length) {
			setTimeout(() => this.playback(), this.timeline[0].delta);
		} else {
			console.log("done!");
		}
	}
};

window.exports = synth;
