
import { MidiFile } from "./midi"


const NOTES = "c c# d d# e f f# g g# a a# b".split(" ");


const synth = {
	init() {
		// fast references
		this.score = window.find(".score .wrapper");
		this.progress = window.find(".progress .bar");
		this.playTime = window.find(".progress .play-time");
		this.songLength = window.find(".progress .song-length");

		window.midi.init();
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
				midi = MidiFile(file.text);
				console.log(midi);
				
				//window.midi.play(file.text);

				// set window title
				window.title = `Synth - ${file.name}`;

				// reset score
				let score = [],
					songLength = 0;

				midi.tracks.map((track, t) => {
					let time = 0,
						record = {};

					track.map(item => {
						let octave,
							note,
							bottom,
							height;

						time += item.deltaTime;

						switch (item.subtype) {
							case "noteOn":
								octave = parseInt(item.noteNumber / 12, 10) - 1;
								note = NOTES[item.noteNumber % 12];
								bottom = parseInt(time / 10, 10);
								record[item.noteNumber] = `<b note="${note}" octave="${octave}" track="${t+1}" style="bottom: ${bottom}px; height: endTime;"></b>`;
								break;
							case "noteOff":
								note = record[item.noteNumber];
								bottom = +note.match(/bottom: (\d{1,})px;/i)[1];
								height = parseInt(time / 10, 10) - bottom;
								score.push(note.replace(/endTime/, height +"px"));
								// delete note from record
								delete record[item.noteNumber];
								break;
							case "setTempo":
							case "setVolume":
							case "programChange":
							case "chordOn":
							case "chordOff":
							case "stopAllNotes":
							case "connect":
								//console.log(item);
								break;
						}
					});

					if (time > songLength) songLength = time;
				});
				
				self.songLength = songLength; // in milliseconds

				self.score
					.css({
						height: (songLength / 10) +"px",
						transform: `translateY(${-(songLength / 10)}px)`,
					})
					.html(score.join(""));
				break;
			// custom events
			case "play-song":
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
				break;
		}
	}
};

window.exports = synth;
