// Background Music System - Wild West Nintendo Adventure
// Auto-plays when game starts

interface Note {
  note: number;
  dur: number;
}

interface Notes {
  C4: number; D4: number; E4: number; F4: number; G4: number; A4: number; B4: number;
  C5: number; D5: number; E5: number; F5: number; G5: number; A5: number; B5: number;
  C6: number; D6: number; E6: number;
}

interface Chords {
  C: number[];
  F: number[];
  G: number[];
  Am: number[];
  Dm: number[];
  Em: number[];
}

class BackgroundMusic {
  audioCtx: AudioContext | null;
  isPlaying: boolean;
  currentSection: string;
  initialized: boolean;
  timeoutId: number | null;
  notes: Notes;
  chords: Chords;
  verseMelody: Note[];
  chorusMelody: Note[];
  verseBass: number[];
  chorusBass: number[];

  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.currentSection = 'verse';
    this.initialized = false;
    this.timeoutId = null;

    // Note frequencies
    this.notes = {
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
      C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
      C6: 1046.5, D6: 1174.7, E6: 1318.5
    };

    // Chords (arpeggiated for 8-bit sound)
    this.chords = {
      C: [this.notes.C4, this.notes.E4, this.notes.G4],
      F: [this.notes.F4, this.notes.A4, this.notes.C5],
      G: [this.notes.G4, this.notes.B4, this.notes.D5],
      Am: [this.notes.A4, this.notes.C5, this.notes.E5],
      Dm: [this.notes.D4, this.notes.F4, this.notes.A4],
      Em: [this.notes.E4, this.notes.G4, this.notes.B4]
    };

    // 16-bar VERSE melody (Wild West meets Nintendo)
    this.verseMelody = [
      // Bar 1-2: Opening with wild west interval (C-G jump)
      { note: this.notes.C5, dur: 0.25 }, { note: this.notes.E5, dur: 0.25 },
      { note: this.notes.G5, dur: 0.25 }, { note: this.notes.E5, dur: 0.125 }, { note: this.notes.D5, dur: 0.125 },
      { note: this.notes.C5, dur: 0.5 }, { note: this.notes.G4, dur: 0.25 }, { note: this.notes.C5, dur: 0.25 },

      // Bar 3-4: Country-style descending pattern
      { note: this.notes.E5, dur: 0.25 }, { note: this.notes.D5, dur: 0.25 },
      { note: this.notes.C5, dur: 0.25 }, { note: this.notes.D5, dur: 0.25 },
      { note: this.notes.E5, dur: 0.375 }, { note: this.notes.F5, dur: 0.125 },
      { note: this.notes.G5, dur: 0.5 },

      // Bar 5-6: Galloping rhythm pattern
      { note: this.notes.G5, dur: 0.125 }, { note: this.notes.A5, dur: 0.125 }, { note: this.notes.G5, dur: 0.25 },
      { note: this.notes.E5, dur: 0.25 }, { note: this.notes.D5, dur: 0.25 },
      { note: this.notes.C5, dur: 0.5 }, { note: this.notes.A4, dur: 0.25 }, { note: this.notes.C5, dur: 0.25 },

      // Bar 7-8: Wild west call-response
      { note: this.notes.D5, dur: 0.25 }, { note: this.notes.E5, dur: 0.25 },
      { note: this.notes.F5, dur: 0.375 }, { note: this.notes.E5, dur: 0.125 },
      { note: this.notes.D5, dur: 0.25 }, { note: this.notes.C5, dur: 0.25 },
      { note: this.notes.D5, dur: 0.5 },

      // Bar 9-10: Repeating motif with variation
      { note: this.notes.C5, dur: 0.25 }, { note: this.notes.E5, dur: 0.25 },
      { note: this.notes.G5, dur: 0.25 }, { note: this.notes.C6, dur: 0.25 },
      { note: this.notes.B5, dur: 0.25 }, { note: this.notes.A5, dur: 0.25 },
      { note: this.notes.G5, dur: 0.5 },

      // Bar 11-12: Chromatic run (Nintendo style)
      { note: this.notes.E5, dur: 0.25 }, { note: this.notes.F5, dur: 0.125 }, { note: this.notes.E5, dur: 0.125 },
      { note: this.notes.D5, dur: 0.25 }, { note: this.notes.E5, dur: 0.25 },
      { note: this.notes.C5, dur: 0.5 }, { note: this.notes.G4, dur: 0.5 },

      // Bar 13-14: Build-up with staccato notes
      { note: this.notes.A4, dur: 0.125 }, { note: this.notes.C5, dur: 0.125 },
      { note: this.notes.E5, dur: 0.125 }, { note: this.notes.A5, dur: 0.125 },
      { note: this.notes.G5, dur: 0.25 }, { note: this.notes.F5, dur: 0.25 },
      { note: this.notes.E5, dur: 0.25 }, { note: this.notes.D5, dur: 0.25 },

      // Bar 15-16: Resolution to tonic
      { note: this.notes.C5, dur: 0.25 }, { note: this.notes.D5, dur: 0.25 },
      { note: this.notes.E5, dur: 0.5 },
      { note: this.notes.C5, dur: 0.75 }, { note: 0, dur: 0.25 }
    ];

    // 16-bar CHORUS melody (More energetic, higher register)
    this.chorusMelody = [
      // Bar 1-2: Energetic upward run
      { note: this.notes.G5, dur: 0.25 }, { note: this.notes.A5, dur: 0.125 }, { note: this.notes.G5, dur: 0.125 },
      { note: this.notes.E5, dur: 0.25 }, { note: this.notes.G5, dur: 0.25 },
      { note: this.notes.C6, dur: 0.375 }, { note: this.notes.B5, dur: 0.125 },
      { note: this.notes.C6, dur: 0.5 },

      // Bar 3-4: Wild west yodel-like jumps
      { note: this.notes.E6, dur: 0.25 }, { note: this.notes.D6, dur: 0.25 },
      { note: this.notes.C6, dur: 0.25 }, { note: this.notes.G5, dur: 0.25 },
      { note: this.notes.A5, dur: 0.5 }, { note: this.notes.G5, dur: 0.5 },

      // Bar 5-6: Galloping rhythm (faster)
      { note: this.notes.G5, dur: 0.125 }, { note: this.notes.A5, dur: 0.125 },
      { note: this.notes.B5, dur: 0.125 }, { note: this.notes.C6, dur: 0.125 },
      { note: this.notes.D6, dur: 0.25 }, { note: this.notes.C6, dur: 0.25 },
      { note: this.notes.B5, dur: 0.25 }, { note: this.notes.A5, dur: 0.25 },
      { note: this.notes.G5, dur: 0.5 },

      // Bar 7-8: Country-style thirds
      { note: this.notes.E5, dur: 0.25 }, { note: this.notes.G5, dur: 0.25 },
      { note: this.notes.F5, dur: 0.25 }, { note: this.notes.A5, dur: 0.25 },
      { note: this.notes.G5, dur: 0.25 }, { note: this.notes.B5, dur: 0.25 },
      { note: this.notes.C6, dur: 0.5 },

      // Bar 9-10: Peak intensity
      { note: this.notes.C6, dur: 0.125 }, { note: this.notes.D6, dur: 0.125 },
      { note: this.notes.E6, dur: 0.25 }, { note: this.notes.D6, dur: 0.25 },
      { note: this.notes.C6, dur: 0.25 }, { note: this.notes.B5, dur: 0.25 },
      { note: this.notes.A5, dur: 0.25 }, { note: this.notes.G5, dur: 0.25 },

      // Bar 11-12: Syncopated pattern
      { note: this.notes.C6, dur: 0.375 }, { note: this.notes.B5, dur: 0.125 },
      { note: this.notes.A5, dur: 0.25 }, { note: this.notes.G5, dur: 0.25 },
      { note: this.notes.F5, dur: 0.25 }, { note: this.notes.E5, dur: 0.25 },
      { note: this.notes.D5, dur: 0.5 },

      // Bar 13-14: Call back to verse
      { note: this.notes.C5, dur: 0.25 }, { note: this.notes.E5, dur: 0.25 },
      { note: this.notes.G5, dur: 0.25 }, { note: this.notes.C6, dur: 0.25 },
      { note: this.notes.G5, dur: 0.25 }, { note: this.notes.E5, dur: 0.25 },
      { note: this.notes.G5, dur: 0.5 },

      // Bar 15-16: Strong resolution
      { note: this.notes.C6, dur: 0.5 }, { note: this.notes.B5, dur: 0.25 },
      { note: this.notes.A5, dur: 0.25 }, { note: this.notes.G5, dur: 0.5 },
      { note: this.notes.C6, dur: 1.0 }
    ];

    // Bass lines for verse (galloping wild west pattern)
    this.verseBass = [
      this.notes.C4, this.notes.C4, this.notes.G4, this.notes.C4,
      this.notes.F4, this.notes.F4, this.notes.C4, this.notes.F4,
      this.notes.G4, this.notes.G4, this.notes.F4, this.notes.G4,
      this.notes.C4, this.notes.C4, this.notes.G4, this.notes.C4,
      this.notes.C4, this.notes.C4, this.notes.A4, this.notes.C4,
      this.notes.F4, this.notes.F4, this.notes.D4, this.notes.F4,
      this.notes.G4, this.notes.G4, this.notes.F4, this.notes.G4,
      this.notes.C4, this.notes.C4, this.notes.G4, this.notes.C4
    ];

    // Bass lines for chorus (more driving)
    this.chorusBass = [
      this.notes.C4, this.notes.C4, this.notes.G4, this.notes.C4,
      this.notes.C4, this.notes.E4, this.notes.G4, this.notes.C4,
      this.notes.G4, this.notes.G4, this.notes.D4, this.notes.G4,
      this.notes.F4, this.notes.F4, this.notes.C4, this.notes.F4,
      this.notes.C4, this.notes.E4, this.notes.G4, this.notes.C4,
      this.notes.F4, this.notes.F4, this.notes.A4, this.notes.F4,
      this.notes.G4, this.notes.G4, this.notes.B4, this.notes.G4,
      this.notes.C4, this.notes.C4, this.notes.C4, this.notes.C4
    ];
  }

  // Initialize audio context (must be called after user interaction)
  init(): void {
    if (!this.initialized) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.initialized = true;
    }
  }

  // Play a single note
  playNote(freq: number, startTime: number, duration: number, type: OscillatorType = 'square', volume: number = 0.15): void {
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain).connect(this.audioCtx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // Drum/percussion sound
  playDrum(type: string, startTime: number, volume: number = 0.2): void {
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    if (type === 'kick') {
      osc.frequency.setValueAtTime(150, startTime);
      osc.frequency.exponentialRampToValueAtTime(50, startTime + 0.1);
      gain.gain.setValueAtTime(volume * 1.5, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
      osc.type = 'sine';
    } else if (type === 'snare') {
      osc.frequency.setValueAtTime(200, startTime);
      gain.gain.setValueAtTime(volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);
      osc.type = 'triangle';
    } else if (type === 'hihat') {
      osc.frequency.setValueAtTime(8000, startTime);
      gain.gain.setValueAtTime(volume * 0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);
      osc.type = 'square';
    }

    osc.connect(gain).connect(this.audioCtx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.15);
  }

  // Play one section of the song
  playSong(): void {
    if (!this.isPlaying || !this.audioCtx) return;

    const start = this.audioCtx.currentTime + 0.1;
    let time = start;

    const melody = this.currentSection === 'verse' ? this.verseMelody : this.chorusMelody;
    const bass = this.currentSection === 'verse' ? this.verseBass : this.chorusBass;

    // Play melody
    melody.forEach(step => {
      if (step.note > 0) {
        this.playNote(step.note, time, step.dur * 0.9, 'square', 0.12);
      }
      time += step.dur;
    });

    // Play bass (galloping rhythm - short-short-long pattern)
    const beatDuration = 0.5;
    bass.forEach((freq: number, i: number) => {
      const bassTime = start + i * beatDuration;
      this.playNote(freq, bassTime, 0.15, 'triangle', 0.15);
      this.playNote(freq, bassTime + 0.15, 0.1, 'triangle', 0.1); // Gallop effect
    });

    // Play chords (arpeggiated for 8-bit feel)
    const chordProgression = this.currentSection === 'verse'
      ? [this.chords.C, this.chords.F, this.chords.G, this.chords.C, this.chords.Am, this.chords.Dm, this.chords.G, this.chords.C]
      : [this.chords.C, this.chords.C, this.chords.G, this.chords.F, this.chords.C, this.chords.F, this.chords.G, this.chords.C];

    chordProgression.forEach((chord, i) => {
      const chordTime = start + i * 2;
      chord.forEach((note, j) => {
        this.playNote(note, chordTime + j * 0.08, 0.2, 'square', 0.06);
      });
    });

    // Add drums/beat (Nintendo style percussion)
    const totalBeats = bass.length;
    for (let i = 0; i < totalBeats; i++) {
      const beatTime = start + i * beatDuration;

      // Kick on 1 and 3
      if (i % 4 === 0 || i % 4 === 2) {
        this.playDrum('kick', beatTime);
      }

      // Snare on 2 and 4
      if (i % 4 === 1 || i % 4 === 3) {
        this.playDrum('snare', beatTime);
      }

      // Hi-hat on every beat
      this.playDrum('hihat', beatTime);
      this.playDrum('hihat', beatTime + 0.25);
    }

    // Switch between verse and chorus
    const sectionDuration = melody.reduce((sum, note) => sum + note.dur, 0) * 1000;

    this.timeoutId = window.setTimeout(() => {
      if (!this.isPlaying) return; // Extra safety check
      this.currentSection = this.currentSection === 'verse' ? 'chorus' : 'verse';
      this.playSong();
    }, sectionDuration + 100);
  }

  // Start playing the background music
  start(): void {
    if (!this.initialized) {
      this.init();
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (!this.isPlaying) {
      this.isPlaying = true;
      this.currentSection = 'verse';
      this.playSong();
    }
  }

  // Stop the background music
  stop(): void {
    this.isPlaying = false;

    // Clear the timeout to stop scheduling new music
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // Suspend the audio context to stop all currently playing sounds
    if (this.audioCtx && this.audioCtx.state === 'running') {
      this.audioCtx.suspend();
    }
  }

  // Toggle music on/off
  toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }
}

export default BackgroundMusic;



