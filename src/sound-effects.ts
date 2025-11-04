// Sound effects for game actions

// Audio context for sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Play "wheeeeeeee" sound when jumping
export function playJumpSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Start high and sweep down for "wheeeee" effect
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
    
    // Volume envelope - fade in and out
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.4);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.6);
    
    oscillator.type = 'sine';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.6);
}

// Play "phschhhhh" phaser sound when shooting
export function playPhaserSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Sweeping phaser effect - start high and drop quickly
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.15);
    
    // Low-pass filter for "shhhh" effect
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.15);
    filter.Q.value = 1;
    
    // Quick attack and decay
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.type = 'sawtooth'; // Sawtooth for harsh phaser sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
}
