// Music toggle button handler

document.addEventListener('DOMContentLoaded', () => {
    const musicToggle = document.getElementById('musicToggle');
    
    // Music starts OFF
    musicToggle.textContent = '🔇 Music: OFF';
    musicToggle.classList.remove('playing');
    
    // Toggle button handler
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
});
