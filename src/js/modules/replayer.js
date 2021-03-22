
/*
 * Rewrite of:
 * https://github.com/gasman/jasmid/blob/master/replayer.js
 */

const Replayer = {
	typeCodes: {
		0x00: "sequenceNumber",
		0x01: "text",
		0x02: "copyrightNotice",
		0x03: "trackName",
		0x04: "instrumentName",
		0x05: "lyrics",
		0x06: "marker",
		0x07: "cuePoint",

		0x08: "noteOff",
		0x09: "noteOn",
		0x0a: "noteAftertouch",
		0x0b: "controller",
		0x0c: "programChange",
		0x0d: "channelAftertouch",
		0x0e: "pitchBendEvent",

		0x20: "midiChannelPrefix",
		0x2f: "endOfTrack",
		0x51: "setTempo",
		0x54: "smpteOffset",
		0x58: "timeSignature",
		0x59: "keySignature",
		0x7f: "sequencerSpecific",
		0xf0: "sysEx",
		0xf7: "dividedSysEx",
		0xff: "meta",
	},
	getLength(temporal) {
		let totalTime = 0.0005;
		for (let n=0, nl=temporal.length; n<nl; n++) {
			totalTime += temporal[n][1];
		}
		return totalTime;
	},
	getTimeline(temporal) {
		let typeCodes = this.typeCodes;
		let sequence = [];
		let record = { "0":{}, "1":{}, "2":{}, "3":{}, "4":{}, "5":{}, "6":{}, "7":{} };
		let time = 0.0005;

		temporal.map(obj => {
			let event = obj[0].event;
			let track = obj[0].track;
			
			// keep track of time
			time += obj[1];

			switch (typeCodes[event.type]) {
				case "setTempo":
					console.log("Tempo change!");
					break;
				case "noteOn":
				case "noteOff":
					// TODO: handle channel MUTE

					let [nr, velocity] = event.data;
					let noteOnEvent = record[track][nr];

					if (noteOnEvent && velocity === 0) {
						// note off: push to sequence
						let octave = Math.floor(nr / 12) - 2,
							note = Notes[nr % 12],
							noteDuration = time - noteOnEvent.time;

						// add entry to notes
						sequence.push(new Note(octave, note, track, noteOnEvent.time, noteDuration));
						
						// delete reference to event
						record[nr] = false;

					} else {
						// note on: save to record
						record[track][nr] = { ...event, time };
					}
					break;
			}
		});

		return sequence;
	},
	parse(midiFile, timeWarp, bpm) {
		let trackStates = [];
		let beatsPerMinute = bpm ? bpm : 120;
		let bpmOverride = bpm ? true : false;
		let ticksPerBeat = midiFile.timeDivision;
		let nextEventInfo;
		let samplesToNextEvent = 0;
		let midiEvent;
		let temporal = [];
		let typeCodes = this.typeCodes;
		
		for (let i=0; i<midiFile.tracks; i++) {
			let ticksToNextEvent = midiFile.track[i].event.length ? midiFile.track[i].event[0].deltaTime : null;
			trackStates[i] = { nextEventIndex: 0, ticksToNextEvent };
		}

		function getNextEvent() {
			let ticksToNextEvent = null;
			let nextEventTrack = null;
			let nextEventIndex = null;
			let result = null;
			
			for (let i=0; i<trackStates.length; i++) {
				let ttne = trackStates[i].ticksToNextEvent;
				if (ttne != null && (ticksToNextEvent == null || ttne < ticksToNextEvent)) {
					ticksToNextEvent = ttne;
					nextEventTrack = i;
					nextEventIndex = trackStates[i].nextEventIndex;
				}
			}

			if (nextEventTrack != null) {
				/* consume event from that track */
				let nextEvent = midiFile.track[nextEventTrack].event[nextEventIndex];
				let afterEvent = midiFile.track[nextEventTrack].event[nextEventIndex + 1];

				if (afterEvent) {
					trackStates[nextEventTrack].ticksToNextEvent += afterEvent.deltaTime;
				} else {
					trackStates[nextEventTrack].ticksToNextEvent = null;
				}

				trackStates[nextEventTrack].nextEventIndex += 1;

				/* advance timings on all tracks by ticksToNextEvent */
				for (let i=0; i<trackStates.length; i++) {
					if (trackStates[i].ticksToNextEvent != null) {
						trackStates[i].ticksToNextEvent -= ticksToNextEvent
					}
				}

				result = {
					ticksToEvent: ticksToNextEvent,
					event: nextEvent,
					track: nextEventTrack
				}
			}

			return result;
		}

		function processEvents() {
			function processNext() {
			    if (!bpmOverride && typeCodes[midiEvent.event.type] == "setTempo" ) {
					// tempo change events can occur anywhere in the middle and affect events that follow
					beatsPerMinute = 60000000 / midiEvent.event.data;
				}
				///
				let beatsToGenerate = 0;
				let secondsToGenerate = 0;

				if (midiEvent.ticksToEvent > 0) {
					beatsToGenerate = midiEvent.ticksToEvent / ticksPerBeat;
					secondsToGenerate = beatsToGenerate / (beatsPerMinute / 60);
				}
				///
				let time = (secondsToGenerate * 1000 * timeWarp) || 0;
				temporal.push([ midiEvent, time]);
				midiEvent = getNextEvent();
			};
			///
			if (midiEvent = getNextEvent()) {
				while(midiEvent) processNext(true);
			}
		}

		processEvents();

		let timeline = this.getTimeline(temporal);
		let duration = this.getLength(temporal) / 1000;

		return { timeline, duration };
	}
};
