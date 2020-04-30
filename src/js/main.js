
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
		await window.midi.init();

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
				if (window.midi.playing) {
					return window.midi.pause();
				} else {
					// start keyboard timeline playback
					setTimeout(self.playback, 500);

					setTimeout(() => {
						self.progressBar.css({
							transform: "translateX(0%)",
							transitionDuration: self.songDuration +"s",
						});
						self.score.css({
							transform: "translateY(-217px)",
							transitionDuration: self.songDuration +"s",
						});
					}, 0);

					// play music
					await window.midi.play();
				}
				break;
			case "parse-file":
				file = event.file;
				// set window title
				window.title = `Synth - ${file.name}`;

				// load & prepare midi buffer
				await window.midi.load(file.buffer);

				midi = MidiParser.parse(file.buffer);
				seq = [];

				midi.track.map((track, i) => {
					let tick = 0;
					track.event.map((event, j) => {
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
				seq.slice(0, 8).map(e => {
					if (e.data[1] > 0) {
						//console.log(e.tick, NOTES[e.data[0] % 12])
					}
				});

				let score = [],
					record = {},
					timeline = [],
					tps = (60 / (120 * midi.timeDivision)),
					lastTick = 0;

				seq.map(item => {
					let noteNumber = item.data[0],
						event = record[noteNumber],
						octave,
						bottom,
						height,
						index,
						el;
					if (item.data[1] === 0 && event) {
						// note off
						bottom = Math.round(event.tick / 10);
						height = Math.round(item.tick / 10) - bottom;

						// save html to score array
						score.push(`<b note="${event.note}" octave="${event.octave}" track="${event.track}" style="bottom: ${bottom}px; height: ${height}px;"><i>${event.note}</i></b>`);

						// 
						timeline[event.index-1].duration = (item.tick - event.tick) * tps * 1000;

						// delete note event from record
						delete record[noteNumber];
					} else if (item.data[1] > 0) {
						octave = parseInt(noteNumber / 12, 10) - 1;
						note = NOTES[noteNumber % 12];
						el = self.keyboard.find(`[octave="${octave}"][note="${note}"]`);

						index = timeline.push({
							el,
							track: item.track,
							tick: item.tick,
						//	duration: item.tick - event.tick,
							delta: (item.tick - lastTick) * tps * 1000,
						});

						// note on
						record[noteNumber] = {
							...item,
							octave,
							note,
							index,
						};
						lastTick = item.tick;
					}
				});

				// calculate song duration
				let songDuration = seq[seq.length-1].tick * tps;
				//console.log(songDuration);

				// plot score HTML
				self.score
					.css({
						height: (songDuration * 100) +"px",
						transform: `translateY(${-(songDuration * 100) + 402}px)`,
					})
					.html(score.join(""));

				// debug
				//timeline.slice(0, 10).map(e => console.log(e.delta, e.duration, e.el[0]));
				timeline.slice(0, 10).map((e, i) => {
					//e.el.addClass("active track-"+ e.track);
					//console.log(e.delta, e.duration, e.el[0]);
				});

				self.timeline = timeline;
				self.songDuration = songDuration;
				
				// progress bar
				window.midi.on("timeupdate", event => {
					let min = Math.floor(event.detail / 60),
						sec = Math.round(event.detail % 60),
						dMin = Math.floor(songDuration / 60),
						dSec = Math.round(songDuration % 60);
					//console.log("duration", window.midi.duration);
					self.progress.attr({
						"data-time": `${min}:${sec < 10 ? "0"+ sec : sec}`,
						"data-length": `${dMin}:${dSec < 10 ? "0"+ dSec : dSec}`,
					});
				});
				break;
		}
	},
	playback() {
		let event = this.timeline.shift(),
			className = "active track-"+ event.track;

		event.el
			.prop({ style: `--duration: ${event.duration}ms;` })
			//.prop({ style: `--duration: 100ms` })
			.cssSequence(className, "transitionend", el => el.prop({ style: "", className: "" }));

		if (this.timeline.length) {
			setTimeout(() => this.playback(), this.timeline[0].delta);
		} else {
			console.log("done!");
		}
	}
};

window.exports = synth;
