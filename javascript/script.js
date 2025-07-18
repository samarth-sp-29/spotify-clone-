let currentAudio = null;
let currentIndex = 0;
let songs = [];
let libraryItems = [];

const songListContainer = document.getElementById("songList");
const libraryContainer = document.querySelector('.library .heading');
const playButton = document.querySelector('.playbar .songbuttons img:nth-child(2)');
const prevButton = document.querySelector('.songbuttons img:nth-child(1)');
const nextButton = document.querySelector('.songbuttons img:nth-child(3)');
const playbar = document.querySelector('.playbar');
playButton.setAttribute('data-tooltip', 'Play/Pause');
prevButton.setAttribute('data-tooltip', 'Previous Song');
nextButton.setAttribute('data-tooltip', 'Next Song');


// Seek Bar
const seekBar = document.createElement('input');
seekBar.type = 'range';
seekBar.min = 0;
seekBar.value = 0;
seekBar.classList.add('seek-bar');
seekBar.style.width = '80%';

// Time Display
const timeDisplay = document.createElement('span');
timeDisplay.classList.add('time-display');

playbar.appendChild(seekBar);
playbar.appendChild(timeDisplay);

async function main() {
    try {
        const res = await fetch("songs.json");
        songs = await res.json();

        songs.forEach((songFile, index) => {
            createSongCard(songFile, index);
            addToLibrary(songFile, index);
        });

    } catch (err) {
        console.error("Failed to load songs:", err);
    }
}

function createSongCard(songFile, index) {
    const songCard = document.createElement("div");
    songCard.classList.add("card");
    songCard.setAttribute('data-index', index);

    songCard.innerHTML = `
        <div class="play" data-index="${index}">
            <img src="play.svg" alt="Play">
        </div>
        <img class="cover" src="cover image.png" alt="Cover">
        <h2>${songFile.replace('.mp3', '')}</h2>
        <audio src="songs/${songFile}" preload="metadata" style="display: none;"></audio>
    `;

    songCard.querySelector('.cover').addEventListener('click', () => handlePlayPause(index));
    songCard.querySelector('.play').addEventListener('click', () => handlePlayPause(index));

    songListContainer.appendChild(songCard);
}

function addToLibrary(songFile, index) {
    const libraryItem = document.createElement('div');
    libraryItem.setAttribute('data-index', index);
    libraryItem.classList.add('library-item');

    libraryItem.innerHTML = `
        <span class="lib-name">${songFile.replace('.mp3', '')}</span>
        <button data-index="${index}" class="lib-btn">
            <img src="play.svg" alt="Play">
        </button>
    `;

    const playPauseButton = libraryItem.querySelector('button');

    // Toggle play/pause when clicking the button
    playPauseButton.addEventListener('click', (e) => {
        e.stopPropagation();
        handlePlayPause(index);
    });

    // Toggle play/pause when clicking the library item itself
    libraryItem.addEventListener('click', () => {
        if (currentIndex === index && currentAudio && !currentAudio.paused) {
            pauseCurrentSong();
        } else {
            playSongAtIndex(index);
        }
    });

    libraryContainer.appendChild(libraryItem);
    libraryItems.push(libraryItem);
}


function handlePlayPause(index) {
    if (currentIndex === index && currentAudio && !currentAudio.paused) {
        pauseCurrentSong();
    } else {
        playSongAtIndex(index);
    }
}

function playSongAtIndex(index) {
    if (currentAudio) {
        currentAudio.pause();
        updateCardIcon(currentIndex, 'play');
        function updateMiniPlayer(index) {
    const miniPlayer = document.getElementById('mini-player-info');
    miniPlayer.innerHTML = `
        <strong>Now Playing:</strong> ${songs[index].replace('.mp3', '')}
    `;
    updateMiniPlayer(index);

}

    }

    clearHighlight();

    currentIndex = index;
    const songCards = document.querySelectorAll('#songList .card');
    currentAudio = songCards[index].querySelector('audio');

    currentAudio.play();
    updatePlayButtonIcon(true);
    updateCardIcon(index, 'pause');
    songCards[index].classList.add('playing');

    updateLibraryIndicator();
    highlightLibraryItem(index);
    attachSeekBar(currentAudio);
}

function pauseCurrentSong() {
    if (currentAudio) {
        currentAudio.pause();
        updatePlayButtonIcon(false);
        updateCardIcon(currentIndex, 'play');
        updateLibraryIndicator();
    }
}

function updatePlayButtonIcon(isPlaying) {
    playButton.src = isPlaying ? 'pause.svg' : 'play.svg';
}

function updateCardIcon(index, state) {
    const card = document.querySelector(`#songList .card[data-index='${index}'] .play img`);
    if (card) {
        card.src = state === 'pause' ? 'pause.svg' : 'play.svg';
    }
}

function updateLibraryIndicator() {
    libraryItems.forEach((item, idx) => {
        const nameSpan = item.querySelector('.lib-name');
        const buttonImg = item.querySelector('button img');

        if (idx === currentIndex && !currentAudio.paused) {
            nameSpan.textContent = ` ${songs[idx].replace('.mp3', '')}`;
            buttonImg.src = 'pause.svg';
            item.classList.add('playing-btn');
        } else {
            nameSpan.textContent = songs[idx].replace('.mp3', '');
            buttonImg.src = 'play.svg';
            item.classList.remove('playing-btn');
        }
    });
}

function highlightLibraryItem(index) {
    libraryItems.forEach(item => item.classList.remove('playing'));
    const activeItem = libraryItems[index];
    if (activeItem) {
        activeItem.classList.add('playing');
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function clearHighlight() {
    document.querySelectorAll('#songList .card').forEach(card => card.classList.remove('playing'));
    libraryItems.forEach(item => item.classList.remove('playing'));
}

playButton.addEventListener('click', () => {
    if (!currentAudio) {
        playSongAtIndex(currentIndex);
    } else if (currentAudio.paused) {
        currentAudio.play();
        updatePlayButtonIcon(true);
        updateCardIcon(currentIndex, 'pause');
        updateLibraryIndicator();
    } else {
        pauseCurrentSong();
    }
});

prevButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    playSongAtIndex(currentIndex);
});

nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % songs.length;
    playSongAtIndex(currentIndex);
});

// SEEK BAR and Time Display
function attachSeekBar(audio) {
    seekBar.max = audio.duration;
    seekBar.value = 0;

    audio.ontimeupdate = () => {
        seekBar.value = audio.currentTime;
        updateTimeDisplay(audio.currentTime, audio.duration);
    };

    seekBar.oninput = () => {
        audio.currentTime = seekBar.value;
    };

    audio.onended = () => {
        nextButton.click();
    };
}

function updateTimeDisplay(current, total) {
    const format = sec => {
        const minutes = Math.floor(sec / 60);
        const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };
    timeDisplay.textContent = `${format(current)} / ${format(total)}`;
}

-



main();


    

// Helper to adjust volume
function adjustVolume(change) {
    if (currentAudio) {
        currentAudio.volume = Math.min(1, Math.max(0, currentAudio.volume + change));
        console.log(`Volume: ${Math.round(currentAudio.volume * 100)}%`);
    }
}

// Mute/Unmute audio
function toggleMute() {
    if (currentAudio) {
        currentAudio.muted = !currentAudio.muted;
        console.log(`Muted: ${currentAudio.muted}`);
    }
}

// Toggle dark/light theme
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    console.log('Theme toggled');
}





// Volume Control setup
const volumeControl = document.getElementById('volume-control');

if (volumeControl) {
    volumeControl.addEventListener('input', () => {
        if (currentAudio) {
            currentAudio.volume = volumeControl.value;
        }
    });
}
