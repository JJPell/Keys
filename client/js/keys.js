const _DEFAULT_KEYS = [	
					["¬", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "BACKSPACE"],
					["TAB", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "ENTER"],
					["CAPS", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", '`', "'", "ENTER"],
					["SHIFT", "\\", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "SHIFT"],
					["CTRL", "WIN", "ALT", "SPACE", "ALT", "WIN", "MENU", "CTRL"]
					];

const _DISABLED_KEYS = ["¬", "BACKSPACE", "TAB", "CAPS", "WIN", "MENU"];

var _MIDI_NOTES = function() {

	let count = 0;
	let octave = -1;
	let returnValue = {};
	let notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
	for (var i = 10; i >= 0; i--) {		
		for (var j = 0; j < notes.length; j++) {
			if(count > 127) {
				break;
			}
			returnValue[count] = notes[j] + octave;
			count++
		};
		octave++;
	};
	return returnValue;	
};

getMIDIString = function(num){

	return _MIDI_NOTES()[num];

}

getMIDINumber = function(str){
	
	let obj = _MIDI_NOTES();
    for( var prop in obj) {
        if( obj.hasOwnProperty( prop ) ) {
             if( obj[ prop ] === str )
                 return prop;
        }
    }
}

audio = [];

class AudioFile {
	constructor(src) {
		this.audio = [];
		this.src = src;
		for (var i = 10; i >= 0; i--) {
			this.audio[this.audio.length] = new buzz.sound(src);
		}
		this.audioPlayback = 0;
	}
	play() {
		if (this.audioPlayback === 10) {
			this.audioPlayback = 0;
		};
		this.audio[this.audioPlayback].play();
		this.audioPlayback++;
		console.log(this.src)
	}
};

class Key {
  constructor(name) {
    this.name = name;
    this.id = name;
    this.note = "C4";
    this.instrument = "Piano";

    this.collapse = name+"Collapse";
    this.dataTarget = "#"+this.collapse;
    this.enableId = name+"Enable";
    this.disableId = name+"Disable";
    this.defaultClass = "btn btn-default btn-lg";
    this.activeClass = "btn btn-default btn-lg active";
    this.disabledClass = "btn btn-default btn-lg disabled";

    this.active = false;
    this.disabled = false;
    this.fixedDisabled = false;
  };
};

function keyDown (keyString) {
	let key = Session.get(keyString);
	key.active = true;
	Session.set(keyString, key);
	if(!key.disabled) {
		audio[getMIDINumber(key.note)].play();
	};

}

function keyUp(keyString) {
	let key = Session.get(keyString);
	key.active = false;
	Session.set(keyString, key);
}

let noteCount = 29;

for (var i = _DEFAULT_KEYS.length - 1; i >= 0; i--) {
	let dKeys = _DEFAULT_KEYS[i];
	for (var j = 0; j < dKeys.length; j++) {	

		Session.set(dKeys[j], new Key(dKeys[j]));
		let currentKey = dKeys[j];
		
		for (var k = _DISABLED_KEYS.length - 1; k >= 0; k--) {
			if(_DISABLED_KEYS[k] === currentKey) {			
				let disabledKey = Session.get(currentKey);
				disabledKey.disabled = true;
				disabledKey.fixedDisabled = true;
				disabledKey.class = disabledKey.disabledClass;
				Session.set(disabledKey.id, disabledKey);
			}
		};
		if(!Session.get(currentKey).disabled) {
			let currentNote = Session.get(currentKey);
			currentNote.note = getMIDIString(noteCount);
			Session.set(currentKey, currentNote);
			noteCount++;
			Mousetrap.bind(currentKey.toLowerCase(), function() { keyDown(currentKey);}, "keydown");
			Mousetrap.bind(currentKey.toLowerCase(), function() { keyUp(currentKey);}, "keyup");
		};
	};
};


Template.body.helpers({
	keysRow1: function() {
		let returnValues = [];
		let dKeys = _DEFAULT_KEYS[0];
		for (let i = 0; i < dKeys.length; i++) {
			returnValues[returnValues.length] = Session.get(dKeys[i]);
		};
		return returnValues;
	},
	keysRow2: function() {
		let returnValues = [];
		let dKeys = _DEFAULT_KEYS[1];
		for (let i = 0; i < dKeys.length; i++) {
			returnValues[returnValues.length] = Session.get(dKeys[i]);
		};
		return returnValues;
	},
	keysRow3: function() {
		let returnValues = [];
		let dKeys = _DEFAULT_KEYS[2];
		for (let i = 0; i < dKeys.length; i++) {
			returnValues[returnValues.length] = Session.get(dKeys[i]);
		};
		return returnValues;
	},
	keysRow4: function() {
		let returnValues = [];
		let dKeys = _DEFAULT_KEYS[3];
		for (let i = 0; i < dKeys.length; i++) {
			returnValues[returnValues.length] = Session.get(dKeys[i]);
		};
		return returnValues;
	},
	keysRow5: function() {
		let returnValues = [];
		let dKeys = _DEFAULT_KEYS[4];
		for (let i = 0; i < dKeys.length; i++) {
			returnValues[returnValues.length] = Session.get(dKeys[i]);
		};
		return returnValues;
	}
});

Template.collapse.events({
	"click .btn.enable": function(event) {
		let key = Session.get(event.target.name);
		key.disabled = false;
		Session.set(event.target.name, key);
	},
	"click .btn.disable": function(event) {
		let key = Session.get(event.target.name);
		key.disabled = true;
		Session.set(event.target.name, key);
	},
	"keydown, blur #noteInput": function(event) {
		let key = Session.get(event.target.name);
		key.note = event.target.value;
		Session.set(event.target.name, key);
	}
});

Template.body.onRendered(function () {

		if (!buzz.isSupported()) {
		    alert("Your browser is does not support HTML5 Audio.");
		}
		if (!buzz.isWAVSupported()) {
		    alert("Your browser doesn't support WAV Format.");
		}
		for (var l = 0; l < 89; l++) {
			audio[l] = new AudioFile("/piano/piano-"+l+".wav"); // VERY STRANGE BUG, BOGGLES THE MIND. Subtract 21 to fix.

		};

});

