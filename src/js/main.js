
import "./midi-parser.js"

const MidiParser = self.MidiParser;
const NOTES = "c c# d d# e f f# g g# a a# b".split(" ");


const synth = {
	init() {
		// fast references
		this.score = window.find(".score .wrapper");
		this.progress = window.find(".progress .bar");
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
					window.music.pause();

					self.progress.css({
						animationPlayState: "paused",
					});
					self.score.css({
						animationPlayState: "paused",
					});
				} else {
					window.music.play();

					setTimeout(() => {
						self.progress.css({
							transform: "translateX(0%)",
							transitionDuration: (self.songLength) +"ms",
						});
						self.score.css({
							transform: "translateY(0)",
							transitionDuration: (self.songLength) +"ms",
						});
					}, 1);
				}

				break;
			case "parse-file":
				file = event.file;

				midi = MidiParser.parse(file.buffer);
				console.log(midi);
return
				// set window title
				window.title = `Synth - ${file.name}`;

				// reset score
				let timeline = [],
					score = [],
					songLength = 0;

				midi.track.map((track, t) => {
					let time = 0,
						record = {};

					track.event.map(item => {
						let octave,
							event,
							noteNumber;
						
						time += item.deltaTime;

						switch (item.type) {
							case 9:
								noteNumber = item.data[0];
								if (item.data[1] === 0 && record[noteNumber]) {
									// note event end
									event = record[noteNumber];
									height = parseInt(time / 10, 10) - event.bottom;

									// save html to score array
									score.push(`<b note="${event.note}" octave="${event.octave}" track="${t+1}" style="bottom: ${event.bottom}px; height: ${height}px;"></b>`);
									timeline.push({
										time: event.time,
										track: event.track,
										delta: event.delta,
										duration: (item.deltaTime * 4) - event.delta,
										el: self.keyboard.find(`[octave="${event.octave}"][note="${event.note}"]`),
									});

									// delete note event from record
									delete record[noteNumber];
								} else {
									// save note event start
									record[noteNumber] = {
										time,
										track: t+1,
										delta: item.deltaTime * 4,
										octave: parseInt(noteNumber / 12, 10) - 1,
										note: NOTES[noteNumber % 12],
										bottom: parseInt(time / 10, 10),
									};
								}
								break;
						}
					});

					if (time > songLength) songLength = time;
				});
				
				timeline = timeline.sort((a, b) => a.time - b.time);
				// console.log(timeline[0].time, timeline[0].track)
				// console.log(timeline[1].time, timeline[1].track)
				// console.log(timeline[2].time, timeline[2].track)
				// console.log(timeline[3].time, timeline[3].track)

				self.timeline = timeline;
				self.songLength = songLength; // in milliseconds

				self.score
					.css({
						height: (songLength / 10) +"px",
						transform: `translateY(${-(songLength / 10) + 375}px)`,
					})
					.html(score.join(""));

				// play music
				window.music.play(file.buffer);

				setTimeout(() => self.playback(), timeline[0].delta + 700);

				setTimeout(() => {
					self.progress.css({
						transform: "translateX(0%)",
						transitionDuration: (self.songLength) +"ms",
					});
					self.score.css({
						transform: "translateY(443px)",
						transitionDuration: (self.songLength) +"ms",
					});
				}, 0);
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
		}
	}
};

window.exports = synth;
