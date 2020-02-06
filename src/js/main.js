
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
		await window.music.init();

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

				midi = MidiParser.parse(file.buffer);
				console.log(midi);

				let timeline = [],
					score = [],
					tickDuration = 0,
					songDuration,
					tps = (60 / (120 * midi.timeDivision));

				midi.track.map((track, i) => {
					let record = {},
						tick = 0,
						lastDelta = 0;

					track.event.map((item, j) => {
						let note,
							event,
							start,
							end,
							el;
						
						tick += item.deltaTime;

						switch (item.type) {
							case 8:
							case 9:
								note = item.data[0];

						if (i === 0 && j === 12) {
							console.log(note, NOTES[note % 12], item);
						}

								if (item.data[1] === 0 && record[note]) {
									// note end event
									event = record[note];
									start = event.tick;
									end = tick - start;
									el = self.keyboard.find(`[octave="${event.octave}"][note="${event.note}"]`);

									// save html to score array
									score.push(`<b note="${event.note}" octave="${event.octave}" track="${event.track + 1}" style="bottom: ${start / 10}px; height: ${end / 10}px;"><i>${event.note}</i></b>`);

									// store event in timeline
									timeline.push({
										el,
										start,
										delta: event.delta,
										duration: parseInt(end * tps * 1000, 10),
										note: event.note,
									});

									// delete note event from record
									delete record[note];
								} else if (item.data[1] > 0) {
									record[note] = {
										tick,
										track: i,
										delta: item.deltaTime,
										octave: parseInt(note / 12, 10) - 1,
										note: NOTES[note % 12],
									};
								}
								break;
						}
						lastDelta = item.deltaTime;
					});
					// song duration in ticks
					if (tick > tickDuration) tickDuration = tick;
				});

				// calculate song duration
				songDuration = tickDuration * tps;

				// plot score HTML
				self.score
					.css({
						height: (songDuration * 100) +"px",
						transform: `translateY(${-(songDuration * 100) + 442}px)`,
					})
					.html(score.join(""));

				// sort timeline
				timeline = timeline.sort((a, b) => a.start - b.start);

				// debug
				timeline.slice(0, 20).map(e => {
					console.log(e.note, " - ", e.delta, e.duration)
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
