
import "./midi-parser.js"

const MidiParser = self.MidiParser;
const NOTES = "c c# d d# e f f# g g# a a# b".split(" ");


const synth = {
	init() {
		// fast references
		this.score = window.find(".score .wrapper");
		this.progress = window.find(".progress");
		this.progressBar = window.find(".progress .bar");
		this.playTime = window.find(".progress .play-time");
		this.songLength = window.find(".progress .song-length");
		this.keyboard = window.find(".keyboard");

		this.dispatch({type: "get-temp-file"});
		//window.midi.init();
	},
	async dispatch(event) {
		let self = synth,
			file,
			midi,
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

				// pre-fetch required lib for midi
				await window.music.init();

				midi = MidiParser.parse(file.buffer);
				console.log(midi);

				let seqeuntializeTracks = () => {

				};

				// reset score
				let timeline = [],
					score = [],
					tps = (60 / (120 * midi.timeDivision));

				midi.track.map((track, t) => {
					let tick = 0;

					track.event.map(item => {
						
					});
				});

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


/*

import "./midi-parser.js"

const MidiParser = self.MidiParser;
const NOTES = "c c# d d# e f f# g g# a a# b".split(" ");


const synth = {
	init() {
		// fast references
		this.score = window.find(".score .wrapper");
		this.progress = window.find(".progress");
		this.progressBar = window.find(".progress .bar");
		this.playTime = window.find(".progress .play-time");
		this.songLength = window.find(".progress .song-length");
		this.keyboard = window.find(".keyboard");

		this.dispatch({type: "get-temp-file"});
		//window.midi.init();
	},
	async dispatch(event) {
		let self = synth,
			file,
			midi,
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

				// pre-fetch required lib for midi
				await window.music.init();

				midi = MidiParser.parse(file.buffer);
				console.log(midi);

				// reset score
				let timeline = [],
					score = [],
					tickDuration = 0,
					songDuration,
					tps = (60 / (120 * midi.timeDivision));

				midi.track.map((track, t) => {
					let tick = 0,
						record = {},
						lastDelta = 0;

					track.event.map(item => {
						switch (item.type) {
							case 8:
							case 9:
								let noteNumber = item.data[0];
								if (item.data[1] === 0 && record[noteNumber]) {
									// note end event
									let event = record[noteNumber],
										bottom = Math.round(event.tick / 10),
										height = Math.round((tick + item.deltaTime) / 10) - bottom,
										el = self.keyboard.find(`[octave="${event.octave}"][note="${event.note}"]`);

									// save html to score array
									score.push(`<b note="${event.note}" octave="${event.octave}" track="${event.track}" style="bottom: ${bottom}px; height: ${height}px;"><i>${event.note}</i></b>`);

									// store event in timeline
									timeline.push({
										...event,
										el,
										tick: tick,
										duration: Math.round((item.deltaTime - lastDelta) * tps * 1000),
									});

									// delete note event from record
									delete record[noteNumber];
								} else if (item.data[1] > 0) {
									// save note start event
									record[noteNumber] = {
										tick,
										track: t+1,
										delta: item.deltaTime,
										octave: parseInt(noteNumber / 12, 10) - 1,
										note: NOTES[noteNumber % 12],
									};
								}
								break;
						}
						lastDelta = item.deltaTime;
						tick += item.deltaTime;
					});

					if (tick > tickDuration) tickDuration = tick;
				});

				// calculate song duration
				songDuration = tickDuration * tps;
				//songDuration += 10;

				// plot score HTML
				self.score
					.css({
						height: (songDuration * 100) +"px",
						transform: `translateY(${-(songDuration * 100) + 375}px)`,
					})
					.html(score.join(""));

				
				timeline = timeline.sort((a, b) => a.tick - b.tick);
				self.timeline = timeline;

				// debug
				timeline.slice(0, 60).map(e => {
					console.log(e.note, " - ", e.tick)
				});

				// start keyboard timeline playback
				//setTimeout(() => self.playback(), 500);

return;
				setTimeout(() => {
					self.progressBar.css({
						transform: "translateX(0%)",
						transitionDuration: songDuration +"s",
					});
					self.score.css({
						transform: "translateY(442px)",
						transitionDuration: songDuration +"s",
					});
				}, 0);

				// play music
				await window.music.play(file.buffer);
				
				// progress bar
				window.music.on("timeupdate", event => {
					let min = Math.floor(event.detail / 60),
						sec = Math.round(event.detail % 60),
						dMin = Math.floor(songDuration / 60),
						dSec = Math.round(songDuration % 60);
					//console.log("duration", window.music.duration);
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

*/

