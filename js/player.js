// Music Player Class
class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('audio-player');
        this.currentTrack = null;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.volume = 0.7;
        this.isShuffled = false;
        this.repeatMode = 0; // 0: no repeat, 1: repeat all, 2: repeat one
        this.queue = [];
        this.currentIndex = 0;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupAudio();
        this.audio.volume = this.volume;
    }

    bindEvents() {
        // Play/Pause button
        document.getElementById('play-pause-btn').addEventListener('click', () => {
            this.togglePlayPause();
        });

        // Previous/Next buttons
        document.getElementById('prev-btn').addEventListener('click', () => {
            this.previousTrack();
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            this.nextTrack();
        });

        // Shuffle button
        document.getElementById('shuffle-btn').addEventListener('click', () => {
            this.toggleShuffle();
        });

        // Repeat button
        document.getElementById('repeat-btn').addEventListener('click', () => {
            this.toggleRepeat();
        });

        // Volume controls
        document.getElementById('volume-range').addEventListener('input', (e) => {
            this.setVolume(e.target.value / 100);
        });

        document.getElementById('volume-btn').addEventListener('click', () => {
            this.toggleMute();
        });

        // Progress bar
        document.getElementById('progress-bar').addEventListener('click', (e) => {
            this.seekTo(e);
        });

        // Like button
        document.getElementById('like-btn').addEventListener('click', () => {
            if (this.currentTrack) {
                app.toggleLike(this.currentTrack.id);
            }
        });
    }

    setupAudio() {
        this.audio.addEventListener('loadedmetadata', () => {
            this.duration = this.audio.duration;
            this.updateTimeDisplay();
        });

        this.audio.addEventListener('timeupdate', () => {
            this.currentTime = this.audio.currentTime;
            this.updateProgress();
            this.updateTimeDisplay();
        });

        this.audio.addEventListener('ended', () => {
            this.handleTrackEnd();
        });

        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayButton();
        });

        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayButton();
        });

        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.nextTrack();
        });
    }

    playTrack(trackId) {
        const track = app.getTrackById(trackId);
        if (!track) return;

        this.currentTrack = track;
        this.audio.src = track.src;
        this.audio.load();
        
        this.updatePlayerUI();
        this.play();
        
        // Add to queue if not already there
        if (!this.queue.find(t => t.id === trackId)) {
            this.addToQueue(track);
        }
        
        this.currentIndex = this.queue.findIndex(t => t.id === trackId);
    }

    playPlaylist(playlistId) {
        const playlist = app.getPlaylistById(playlistId);
        if (!playlist || playlist.tracks.length === 0) return;

        this.queue = playlist.tracks.map(trackId => app.getTrackById(trackId)).filter(track => track);
        this.currentIndex = 0;
        
        if (this.isShuffled) {
            this.shuffleQueue();
        }
        
        this.playTrack(this.queue[0].id);
    }

    addToQueue(track) {
        if (!this.queue.find(t => t.id === track.id)) {
            this.queue.push(track);
        }
    }

    play() {
        if (this.audio.src) {
            this.audio.play().catch(e => {
                console.error('Play error:', e);
            });
        }
    }

    pause() {
        this.audio.pause();
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    previousTrack() {
        if (this.queue.length === 0) return;

        if (this.currentTime > 3) {
            // If more than 3 seconds played, restart current track
            this.audio.currentTime = 0;
            return;
        }

        this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.queue.length - 1;
        this.playTrack(this.queue[this.currentIndex].id);
    }

    nextTrack() {
        if (this.queue.length === 0) return;

        if (this.repeatMode === 2) {
            // Repeat current track
            this.audio.currentTime = 0;
            this.play();
            return;
        }

        this.currentIndex = this.currentIndex < this.queue.length - 1 ? this.currentIndex + 1 : 0;
        
        if (this.currentIndex === 0 && this.repeatMode === 0) {
            // End of queue and no repeat
            this.pause();
            return;
        }
        
        this.playTrack(this.queue[this.currentIndex].id);
    }

    handleTrackEnd() {
        if (this.repeatMode === 2) {
            // Repeat current track
            this.audio.currentTime = 0;
            this.play();
        } else {
            this.nextTrack();
        }
    }

    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        const shuffleBtn = document.getElementById('shuffle-btn');
        
        if (this.isShuffled) {
            shuffleBtn.style.color = '#1db954';
            this.shuffleQueue();
        } else {
            shuffleBtn.style.color = '#b3b3b3';
            // Restore original order
            this.queue.sort((a, b) => a.id - b.id);
        }
    }

    shuffleQueue() {
        if (this.queue.length <= 1) return;
        
        const currentTrack = this.queue[this.currentIndex];
        
        // Remove current track temporarily
        const otherTracks = this.queue.filter((_, index) => index !== this.currentIndex);
        
        // Shuffle other tracks
        for (let i = otherTracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [otherTracks[i], otherTracks[j]] = [otherTracks[j], otherTracks[i]];
        }
        
        // Rebuild queue with current track first
        this.queue = [currentTrack, ...otherTracks];
        this.currentIndex = 0;
    }

    toggleRepeat() {
        this.repeatMode = (this.repeatMode + 1) % 3;
        const repeatBtn = document.getElementById('repeat-btn');
        const icon = repeatBtn.querySelector('i');
        
        switch (this.repeatMode) {
            case 0:
                repeatBtn.style.color = '#b3b3b3';
                icon.className = 'fas fa-redo';
                break;
            case 1:
                repeatBtn.style.color = '#1db954';
                icon.className = 'fas fa-redo';
                break;
            case 2:
                repeatBtn.style.color = '#1db954';
                icon.className = 'fas fa-redo-alt';
                break;
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.audio.volume = this.volume;
        this.updateVolumeIcon();
    }

    toggleMute() {
        if (this.volume > 0) {
            this.previousVolume = this.volume;
            this.setVolume(0);
            document.getElementById('volume-range').value = 0;
        } else {
            this.setVolume(this.previousVolume || 0.7);
            document.getElementById('volume-range').value = (this.previousVolume || 0.7) * 100;
        }
    }

    updateVolumeIcon() {
        const volumeBtn = document.getElementById('volume-btn');
        const icon = volumeBtn.querySelector('i');
        
        if (this.volume === 0) {
            icon.className = 'fas fa-volume-mute';
        } else if (this.volume < 0.5) {
            icon.className = 'fas fa-volume-down';
        } else {
            icon.className = 'fas fa-volume-up';
        }
    }

    seekTo(event) {
        if (!this.duration) return;
        
        const progressBar = document.getElementById('progress-bar');
        const rect = progressBar.getBoundingClientRect();
        const percent = (rect.right - event.clientX) / rect.width; // RTL adjustment
        const newTime = percent * this.duration;
        
        this.audio.currentTime = newTime;
    }

    updateProgress() {
        if (!this.duration) return;
        
        const percent = (this.currentTime / this.duration) * 100;
        document.getElementById('progress-fill').style.width = `${percent}%`;
    }

    updateTimeDisplay() {
        document.getElementById('current-time').textContent = this.formatTime(this.currentTime);
        document.getElementById('total-time').textContent = this.formatTime(this.duration);
    }

    updatePlayButton() {
        const playBtn = document.getElementById('play-pause-btn');
        const icon = playBtn.querySelector('i');
        
        if (this.isPlaying) {
            icon.className = 'fas fa-pause';
        } else {
            icon.className = 'fas fa-play';
        }
    }

    updatePlayerUI() {
        if (!this.currentTrack) return;
        
        document.getElementById('current-title').textContent = this.currentTrack.title;
        document.getElementById('current-artist').textContent = this.currentTrack.artist;
        document.getElementById('current-cover').src = this.currentTrack.cover;
        document.getElementById('current-cover').onerror = function() {
            this.src = 'images/default-cover.jpg';
        };
        
        // Update like button
        const likedPlaylist = app.playlists.find(p => p.name === "آهنگ‌های پسندیده");
        const isLiked = likedPlaylist && likedPlaylist.tracks.includes(this.currentTrack.id);
        app.updateLikeButton(this.currentTrack.id, isLiked);
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Queue management
    showQueue() {
        // This would open a queue modal/sidebar
        console.log('Current queue:', this.queue);
    }

    clearQueue() {
        this.queue = [];
        this.currentIndex = 0;
    }

    removeFromQueue(trackId) {
        const index = this.queue.findIndex(track => track.id === trackId);
        if (index > -1) {
            this.queue.splice(index, 1);
            if (index < this.currentIndex) {
                this.currentIndex--;
            } else if (index === this.currentIndex) {
                if (this.queue.length > 0) {
                    this.currentIndex = Math.min(this.currentIndex, this.queue.length - 1);
                    this.playTrack(this.queue[this.currentIndex].id);
                } else {
                    this.pause();
                    this.currentTrack = null;
                }
            }
        }
    }
}

// Initialize player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.musicPlayer = new MusicPlayer();
});