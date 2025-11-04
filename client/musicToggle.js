// Music toggle button handler

const musicToggle = document.getElementById('musicToggle');

musicToggle.addEventListener('click', () => {
    const isPlaying = bgMusic.toggle();
    
    if (isPlaying) {
        musicToggle.textContent = '🎵 Music: ON';
        musicToggle.classList.add('playing');
    } else {
        musicToggle.textContent = '🔇 Music: OFF';
        musicToggle.classList.remove('playing');
    }
});
