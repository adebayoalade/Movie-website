// Cinema data
const cinemas = [
    {
        id: 1,
        name: 'MovieTix IMAX Lekki',
        location: 'Lekki Phase 1, Lagos',
        area: 'south',
        type: 'IMAX',
        image: 'images/cinemas/lekki-imax.jpg',
        amenities: [
            { icon: 'fa-parking', text: 'Free Parking' },
            { icon: 'fa-wheelchair', text: 'Wheelchair Access' },
            { icon: 'fa-utensils', text: 'Food Court' }
        ],
        coordinates: { lat: 6.4281, lng: 3.4219 }
    },
    {
        id: 2,
        name: 'MovieTix Victoria Island',
        location: 'Victoria Island, Lagos',
        area: 'south',
        type: '4DX',
        image: 'images/cinemas/vi-4dx.jpg',
        amenities: [
            { icon: 'fa-parking', text: 'Paid Parking' },
            { icon: 'fa-couch', text: 'VIP Lounge' },
            { icon: 'fa-utensils', text: 'Restaurant' }
        ],
        coordinates: { lat: 6.4279, lng: 3.4217 }
    },
    // Add more cinemas...
];

// Filter and search functionality
const locationSearch = document.getElementById('location-search');
const areaFilter = document.getElementById('area-filter');
const cinemasGrid = document.querySelector('.cinemas-grid');

function filterCinemas() {
    const searchTerm = locationSearch.value.toLowerCase();
    const selectedArea = areaFilter.value;

    const filteredCinemas = cinemas.filter(cinema => {
        const matchesSearch = cinema.name.toLowerCase().includes(searchTerm) || 
                            cinema.location.toLowerCase().includes(searchTerm);
        const matchesArea = !selectedArea || cinema.area === selectedArea;
        return matchesSearch && matchesArea;
    });

    displayCinemas(filteredCinemas);
}

function displayCinemas(cinemasToShow) {
    cinemasGrid.innerHTML = cinemasToShow.map(cinema => `
        <div class="cinema-card">
            <div class="cinema-image">
                <img src="${cinema.image}" alt="${cinema.name}">
                <div class="cinema-badge">${cinema.type}</div>
            </div>
            <div class="cinema-info">
                <h3>${cinema.name}</h3>
                <p class="location"><i class="fas fa-map-marker-alt"></i> ${cinema.location}</p>
                <div class="amenities">
                    ${cinema.amenities.map(amenity => `
                        <span><i class="fas ${amenity.icon}"></i> ${amenity.text}</span>
                    `).join('')}
                </div>
                <div class="cinema-actions">
                    <button class="view-times-btn" onclick="viewShowtimes(${cinema.id})">View Showtimes</button>
                    <button class="directions-btn" onclick="getDirections(${cinema.coordinates.lat}, ${cinema.coordinates.lng})">
                        <i class="fas fa-directions"></i> Get Directions
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Event listeners
locationSearch.addEventListener('input', filterCinemas);
areaFilter.addEventListener('change', filterCinemas);

// Initialize display
displayCinemas(cinemas);

// Functions for buttons
function viewShowtimes(cinemaId) {
    // Redirect to showtimes page with cinema ID
    window.location.href = `showtimes.html?cinema=${cinemaId}`;
}

function getDirections(lat, lng) {
    // Open Google Maps directions
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
} 