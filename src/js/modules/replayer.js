
/*
 * Rewrite of:
 * https://github.com/gasman/jasmid/blob/master/replayer.js
 */

const Replayer = {
	getLength(temporal) {
		let totalTime = 0.5;
		for (let n=0, nl=temporal.length; n<nl; n++) {
			totalTime += temporal[n][1];
		}
		return totalTime;
	},
	getTimeline(temporal) {
		let data = [];
		var offset = 0;
		var messages = 0;

		for (let n=0, nl=temporal.length; n<nl; n++) {
			var obj = data[n];
			// var event = obj[0].event;

		}

		return data;
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
				let event = midiEvent.event;

				switch (event.type) {
					case 0xff:
						// console.log("meta", event);
						break;
					case 0xf0:
						// console.log("sysEx", event);
						break;
					case 0xf7:
						// console.log("dividedSysEx", event);
						break;
					case 0x08:
						// console.log("noteOff", event);
						break;
					default:
						console.log(event)
				}

			    if (!bpmOverride && event.type == "meta" && event.subtype == "setTempo" ) {
					// tempo change events can occur anywhere in the middle and affect events that follow
					beatsPerMinute = 60000000 / event.microsecondsPerBeat;
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

		let end = this.getLength(temporal);
		let timeline = this.getTimeline(temporal);

		return { timeline, end };
	}
};
