// Coming soon movies data and functionality
const upcomingMovies = [
    {
        id: 'tt15398776',
        title: 'Oppenheimer',
        releaseDate: '2024-07-21',
        genre: ['Drama', 'History'],
        poster: 'https://images.pexels.com/photos/7618388/pexels-photo-7618388.jpeg?auto=compress&cs=tinysrgb&w=600',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.'
    },
    // Add more movies...
];

// Filter functionality
const movieSearch = document.getElementById('movie-search');
const genreSelect = document.getElementById('genre-select');
const filterBtns = document.querySelectorAll('.filter-btn');
const comingSoonGrid = document.getElementById('coming-soon-grid');

function filterMovies() {
    const searchTerm = movieSearch.value.toLowerCase();
    const selectedGenre = genreSelect.value.toLowerCase();
    const selectedMonth = document.querySelector('.filter-btn.active').dataset.month;

    const filteredMovies = upcomingMovies.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
        const matchesGenre = !selectedGenre || movie.genre.some(g => g.toLowerCase() === selectedGenre);
        const releaseDate = new Date(movie.releaseDate);
        const today = new Date();
        
        let matchesMonth = true;
        if (selectedMonth === 'this') {
            matchesMonth = releaseDate.getMonth() === today.getMonth();
        } else if (selectedMonth === 'next') {
            matchesMonth = releaseDate.getMonth() === (today.getMonth() + 1) % 12;
        } else if (selectedMonth === 'later') {
            matchesMonth = releaseDate.getMonth() > (today.getMonth() + 1) % 12;
        }

        return matchesSearch && matchesGenre && matchesMonth;
    });

    displayMovies(filteredMovies);
}

function displayMovies(moviesToShow) {
    comingSoonGrid.innerHTML = moviesToShow.map(movie => `
        <div class="movie-card coming-soon-card">
            <div class="movie-card-image">
                <img src="${movie.poster}" alt="${movie.title}">
                <div class="movie-card-overlay">
                    <div class="rating">
                        <i class="fas fa-calendar"></i>
                        <span>Coming Soon</span>
                    </div>
                    <div class="card-buttons">
                        <button class="view-details-btn" onclick="openMovieModal('${movie.id}')">
                            <i class="fas fa-info-circle"></i> Details
                        </button>
                        <button class="notify-btn" onclick="setReminder('${movie.id}', '${movie.title}')">
                            <i class="fas fa-bell"></i> Notify Me
                        </button>
                    </div>
                </div>
            </div>
            <div class="movie-card-content">
                <h3>${movie.title}</h3>
                <p class="release-date">Release: ${formatDate(movie.releaseDate)}</p>
                <div class="genre-tags">
                    ${movie.genre.map(genre => 
                        `<span class="genre-tag">${genre}</span>`
                    ).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Helper functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function setReminder(movieId, movieTitle) {
    // Here you would typically integrate with a notification service
    // For now, we'll just show a toast
    showToast(`You'll be notified when "${movieTitle}" releases!`);
}

// Event listeners
movieSearch.addEventListener('input', filterMovies);
genreSelect.addEventListener('change', filterMovies);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterMovies();
    });
});

// Initialize display
displayMovies(upcomingMovies); 