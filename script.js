// DOM Elements
const heroSlider = document.getElementById('hero-slider');
const moviesGrid = document.getElementById('movies-grid');
const featuredSlider = document.getElementById('featured-slider');
const countdown = document.getElementById('countdown');
const cartCount = document.getElementById('cart-count');

// Cart functionality
let cart = [];
const cartModal = document.getElementById('cart-modal');
const checkoutModal = document.getElementById('checkout-modal');
const cartBtn = document.getElementById('cart-btn');
const closeCart = document.getElementById('close-cart');
const closeCheckout = document.getElementById('close-checkout');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutForm = document.getElementById('checkout-form');

// Add to cart function
function addToCart(movieId, title, price, showtime = null, seats = []) {
    const existingItem = cart.find(item => 
        item.id === movieId && 
        item.showtime === showtime && 
        JSON.stringify(item.seats) === JSON.stringify(seats)
    );

    if (existingItem) {
        existingItem.quantity += 1;
        showToast(`Added another ticket for "${title}"`);
    } else {
        cart.push({
            id: movieId,
            title: title,
            price: parseFloat(price),
            quantity: 1,
            showtime: showtime,
            seats: seats
        });
        showToast(`"${title}" added to cart`);
    }
    
    // Add pulse animation
    const cartBtn = document.getElementById('cart-btn');
    cartBtn.classList.add('pulse');
    setTimeout(() => {
        cartBtn.classList.remove('pulse');
    }, 1000);
    
    updateCart();
}

// Update cart display
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotal.textContent = '₦0.00';
        cartCount.textContent = '0';
        return;
    }

    let total = 0;
    let itemsCount = 0;

    cartItems.innerHTML = cart.map((item, index) => {
        total += item.price * item.quantity;
        itemsCount += item.quantity;

        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h3>${item.title}</h3>
                    ${item.showtime ? `<p>Showtime: ${item.showtime}</p>` : ''}
                    ${item.seats.length ? `<p>Seats: ${item.seats.join(', ')}</p>` : ''}
                    <p>Price: ₦${item.price.toFixed(2)} × ${item.quantity}</p>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-btn minus" onclick="updateQuantity(${index}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" onclick="updateQuantity(${index}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="remove-btn" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    cartTotal.textContent = `₦${total.toFixed(2)}`;
    cartCount.textContent = itemsCount.toString();
}

// Remove from cart
function removeFromCart(id, showtime) {
    cart = cart.filter(item => !(item.id === id && item.showtime === showtime));
    updateCart();
    showToast('Item removed from cart');
}

// Update quantity
function updateQuantity(index, change) {
    const newQuantity = cart[index].quantity + change;
    
    if (newQuantity <= 0) {
        removeFromCart(index);
    } else {
        cart[index].quantity = newQuantity;
        updateCart();
        showToast(`Quantity updated to ${newQuantity}`);
    }
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }, 100);
}

// Event Listeners
cartBtn.addEventListener('click', () => {
    cartModal.style.display = 'block';
    updateCart();
});

closeCart.addEventListener('click', () => {
    cartModal.style.display = 'none';
});

closeCheckout.addEventListener('click', () => {
    checkoutModal.style.display = 'none';
});

cartItems.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) return;

    const { id, showtime } = button.dataset;
    
    if (button.classList.contains('minus')) {
        updateQuantity(id, showtime, -1);
    } else if (button.classList.contains('plus')) {
        updateQuantity(id, showtime, 1);
    } else if (button.classList.contains('remove-btn')) {
        removeFromCart(id, showtime);
    }
});

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        showToast('Your cart is empty');
        return;
    }
    cartModal.style.display = 'none';
    checkoutModal.style.display = 'block';
});

checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    
    if (!email) {
        showToast('Please enter your email address');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    checkoutModal.style.display = 'none';
    initiatePaystackPayment(total, email);
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.style.display = 'none';
    }
    if (e.target === checkoutModal) {
        checkoutModal.style.display = 'none';
    }
});


// API Configuration
const OMDB_API_KEY = '9c7fa901'; // OMDB API Key
const OMDB_BASE_URL = 'https://www.omdbapi.com';

// Update the fetch functions
async function fetchHeroMovies() {
    try {
        // Fetch popular movies (using specific movie IDs for better results)
        const popularMovieIds = ['tt1517268', 'tt6166392', 'tt15398776', 'tt9362722', 'tt10366206'];
        const moviesWithDetails = await Promise.all(
            popularMovieIds.map(async id => {
                const response = await fetch(`${OMDB_BASE_URL}/?i=${id}&apikey=${OMDB_API_KEY}`);
                return await response.json();
            })
        );
        displayHeroSlider(moviesWithDetails);
    } catch (error) {
        console.error('Error fetching hero movies:', error);
    }
}

// Update the display function
function displayHeroSlider(movies) {
    // Set initial background image
    const firstMovie = movies[0];
    document.querySelector('.hero').style.backgroundImage = `url('${firstMovie.backdrop}')`;

    heroSlider.innerHTML = movies.map((movie, index) => `
        <div class="hero-slide ${index === 0 ? 'active' : ''}" 
            data-backdrop="${movie.backdrop}">
            <div class="hero-slide-content">
                <h2>${movie.Title}</h2>
                <p>${movie.Plot}</p>
                <div class="hero-buttons">
                    <button class="book-now-btn" onclick="openMovieModal('${movie.imdbID}')">
                        <i class="fas fa-ticket-alt"></i> Book Now
                    </button>
                    <button class="watch-trailer-btn" onclick="playTrailer('${movie.imdbID}')">
                        <i class="fas fa-play"></i> Watch Trailer
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Auto slide functionality
    let currentSlide = 0;
    const slides = document.querySelectorAll('.hero-slide');
    const hero = document.querySelector('.hero');

    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
        
        const nextBackdrop = slides[currentSlide].dataset.backdrop;
        hero.style.backgroundImage = `url('${nextBackdrop}')`;
    }, 5000);
}

// Update fetchNowShowing function
async function fetchNowShowing() {
    try {
        // Fetch recent movies using search
        const response = await fetch(`${OMDB_BASE_URL}/?s=2024&type=movie&apikey=${OMDB_API_KEY}`);
        const data = await response.json();
        
        if (data.Search) {
            // Get full details for each movie
            const moviesWithDetails = await Promise.all(
                data.Search.map(async movie => {
                    const detailResponse = await fetch(`${OMDB_BASE_URL}/?i=${movie.imdbID}&apikey=${OMDB_API_KEY}`);
                    return await detailResponse.json();
                })
            );
            displayMovies(moviesWithDetails);
        }
    } catch (error) {
        console.error('Error fetching now showing movies:', error);
    }
}

// Update the display movies function
function displayMovies(movies) {
    moviesGrid.innerHTML = movies.map(movie => `
        <div class="movie-card">
            <div class="movie-card-image">
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450'}" 
                     alt="${movie.Title}">
                <div class="movie-card-overlay">
                    <div class="rating">
                        <i class="fas fa-star"></i>
                        <span>${movie.imdbRating} / 10</span>
                    </div>
                    <div class="card-buttons">
                        <button class="view-details-btn" onclick="openMovieModal('${movie.imdbID}')">
                            <i class="fas fa-info-circle"></i> Details
                        </button>
                        <button class="add-to-cart-btn" onclick="addToCart('${movie.imdbID}', '${movie.Title}', 12.99)">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
            <div class="movie-card-content">
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
                <p class="movie-price">$12.99</p>
            </div>
        </div>
    `).join('');
}

// Update the movie modal function
async function openMovieModal(imdbID) {
    const movieModal = document.getElementById('movie-modal');
    const movieDetails = document.querySelector('.movie-details');
    
    try {
        const response = await fetch(`${OMDB_BASE_URL}/?i=${imdbID}&apikey=${OMDB_API_KEY}`);
        const movie = await response.json();
        
        movieDetails.innerHTML = `
            <div class="modal-header" 
                style="background-image: url('${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/1920x1080'}')">
                <span class="close-btn">&times;</span>
                <div class="modal-movie-info">
                    <h2>${movie.Title}</h2>
                    <div class="movie-meta">
                        <span>${movie.Year}</span>
                        <span>${movie.Runtime}</span>
                        <span>${movie.imdbRating} ⭐</span>
                    </div>
                </div>
            </div>
            <div class="modal-body">
                <p>${movie.Plot}</p>
                <div class="movie-cast">
                    <h3>Cast</h3>
                    <p>${movie.Actors}</p>
                </div>
                <div class="movie-info">
                    <p><strong>Director:</strong> ${movie.Director}</p>
                    <p><strong>Genre:</strong> ${movie.Genre}</p>
                </div>
                <div class="booking-section">
                    <div class="price-info">
                        <h3>Price: $12.99</h3>
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCart('${movie.imdbID}', '${movie.Title}', 12.99)">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;

        movieModal.style.display = 'block';

        const closeBtn = movieDetails.querySelector('.close-btn');
        closeBtn.onclick = () => {
            movieModal.style.display = 'none';
        };

    } catch (error) {
        console.error('Error fetching movie details:', error);
    }
}

// Update the featured movies function
async function fetchFeaturedMovies() {
    try {
        const response = await fetch(`${OMDB_BASE_URL}/?s=2023&type=movie&apikey=${OMDB_API_KEY}`);
        const data = await response.json();
        
        if (data.Search) {
            const moviesWithDetails = await Promise.all(
                data.Search.slice(0, 8).map(async movie => {
                    const detailResponse = await fetch(`${OMDB_BASE_URL}/?i=${movie.imdbID}&apikey=${OMDB_API_KEY}`);
                    return await detailResponse.json();
                })
            );
            displayFeaturedSlider(moviesWithDetails);
        }
    } catch (error) {
        console.error('Error fetching featured movies:', error);
    }
}

// Update the featured slider function
function displayFeaturedSlider(movies) {
    featuredSlider.innerHTML = movies.map(movie => `
        <div class="featured-movie">
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450'}" 
                 alt="${movie.Title}">
            <div class="featured-movie-info">
                <h3>${movie.Title}</h3>
                <p>${movie.Type} (${movie.Year})</p>
                <button onclick="openMovieModal('${movie.imdbID}')">Book Tickets</button>
            </div>
        </div>
    `).join('');
}

// Generate showtimes
function generateShowtimes() {
    const showtimeGrid = document.getElementById('showtime-grid');
    const times = ['10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM', '10:00 PM'];
    
    showtimeGrid.innerHTML = times.map(time => `
        <button class="time-slot" onclick="showSeatSelection(this)">
            ${time}
            <span class="price">$12.99</span>
        </button>
    `).join('');
}

// Countdown timer
function startCountdown() {
    // Set the next show time to the nearest future show time
    const showTimes = [10, 13, 16, 19, 22]; // 24-hour format
    const now = new Date();
    let nextShow = new Date();
    
    // Find the next show time
    const currentHour = now.getHours();
    const nextHour = showTimes.find(hour => hour > currentHour) || showTimes[0];
    
    if (nextHour <= currentHour) {
        nextShow.setDate(nextShow.getDate() + 1);
    }
    nextShow.setHours(nextHour, 0, 0, 0);

    // Update countdown every second
    setInterval(() => {
        const now = new Date();
        const diff = nextShow - now;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }, 1000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchHeroMovies();
    fetchNowShowing();
    fetchFeaturedMovies();
    startCountdown();
    initializeCartHandlers();

    // Cart button listener
    cartBtn.addEventListener('click', () => {
        cartModal.style.display = 'block';
        updateCart();
    });

    // Close cart modal
    closeCart.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    // Close checkout modal
    closeCheckout.addEventListener('click', () => {
        checkoutModal.style.display = 'none';
    });

    // Cart item actions
    cartItems.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const { id, showtime } = button.dataset;
        
        if (button.classList.contains('minus')) {
            updateQuantity(id, showtime, -1);
        } else if (button.classList.contains('plus')) {
            updateQuantity(id, showtime, 1);
        } else if (button.classList.contains('remove-btn')) {
            removeFromCart(id, showtime);
        }
    });

    // Checkout button
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Your cart is empty');
            return;
        }
        cartModal.style.display = 'none';
        checkoutModal.style.display = 'block';
    });

    // Checkout form
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        
        if (!email) {
            showToast('Please enter your email address');
            return;
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        checkoutModal.style.display = 'none';
        initiatePaystackPayment(total, email);
    });

    // Add filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Implement filtering logic here
        });
    });

    // Fetch coming soon movies
    fetchComingSoon();
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Add trailer functionality
function playTrailer(videoKey) {
    const modal = document.createElement('div');
    modal.className = 'trailer-modal';
    modal.innerHTML = `
        <div class="trailer-content">
            <span class="close-trailer">&times;</span>
            <iframe src="https://www.youtube.com/embed/${videoKey}?autoplay=1" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.close-trailer').onclick = () => {
        modal.remove();
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

// Remove the duplicate styles declarations and combine them
const styles = `
    /* Booking Section Styles */
    .booking-section {
        margin-top: 2rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
    }

    .price-info {
        margin-bottom: 1rem;
    }

    .add-to-cart-btn {
        width: 100%;
        padding: 1rem;
        background: linear-gradient(45deg, #e50914, #ff3b30);
        border: none;
        border-radius: 10px;
        color: white;
        font-size: 1.1rem;
        cursor: pointer;
        transition: all 0.3s;
    }

    .add-to-cart-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(229, 9, 20, 0.3);
    }

    /* Movie Card Styles */
    .movie-card {
        cursor: pointer;
        transition: transform 0.3s ease;
    }

    .movie-card:hover {
        transform: translateY(-5px);
    }

    .modal-header .close-btn {
        position: absolute;
        top: 20px;
        right: 20px;
        font-size: 30px;
        color: white;
        cursor: pointer;
        z-index: 100;
    }

    .add-to-cart-btn i {
        margin-right: 8px;
    }

    .movie-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        z-index: 1000;
        overflow-y: auto;
    }

    .modal-content {
        position: relative;
        background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%);
        margin: 5% auto;
        width: 90%;
        max-width: 800px;
        border-radius: 15px;
        overflow: hidden;
    }

    /* Checkout Button Styles */
    .checkout-btn {
        width: 100%;
        padding: 1.2rem;
        background: linear-gradient(45deg, #00c853, #69f0ae);
        border: none;
        border-radius: 15px;
        color: white;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        margin-top: 1rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .checkout-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba(0, 200, 83, 0.3);
    }

    .cart-total {
        font-size: 1.3rem;
        font-weight: 600;
        color: #69f0ae;
        margin-bottom: 1rem;
        text-align: right;
    }
`;

// Update the styles (remove additionalStyles variable)
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Add Paystack configuration
const PAYSTACK_PUBLIC_KEY = 'pk_test_add66ab0e17e5f355bc01f22f46a617a8b4eace8'; // Replace with your Paystack public key

// Add Paystack payment function
function initiatePaystackPayment(amount, email) {
    const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: amount * 100, // Paystack expects amount in kobo
        currency: 'NGN',
        ref: 'MTX'+Math.floor((Math.random() * 1000000000) + 1),
        callback: function(response) {
            showToast('Payment successful! Reference: ' + response.reference);
            cart = [];
            updateCart();
            cartModal.style.display = 'none';
        },
        onClose: function() {
            showToast('Payment cancelled');
            cartModal.style.display = 'block';
        }
    });
    
    handler.openIframe();
}

// Add these styles for better quantity buttons
const cartStyles = `
    .cart-item-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .quantity-btn {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: none;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }

    .quantity-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
    }

    .quantity-btn i {
        font-size: 0.8rem;
    }

    .quantity {
        font-size: 1.1rem;
        min-width: 24px;
        text-align: center;
        font-weight: 600;
    }

    .remove-btn {
        background: none;
        border: none;
        color: #ff3366;
        cursor: pointer;
        transition: all 0.3s;
        opacity: 0.8;
        padding: 5px;
    }

    .remove-btn:hover {
        opacity: 1;
        transform: scale(1.1);
    }

    .cart-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255, 255, 255, 0.05);
        padding: 1rem;
        border-radius: 15px;
        margin-bottom: 1rem;
        transition: all 0.3s ease;
    }

    .cart-item:hover {
        background: rgba(255, 255, 255, 0.08);
        transform: translateY(-2px);
    }

    .cart-item-info h3 {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
    }

    .cart-item-info p {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
        margin-bottom: 0.3rem;
    }
`;

// Update the styles
styleSheet.textContent += cartStyles;

// Add these functions for Coming Soon section
async function fetchComingSoon() {
    try {
        // Example upcoming movie IDs (you can replace these with actual upcoming movies)
        const upcomingMovieIds = [
            'tt15398776', // Oppenheimer
            'tt9362722',  // Spider-Man: Across the Spider-Verse
            'tt10366206', // John Wick 4
            'tt5090568',  // Transformers: Rise of the Beasts
            'tt6718170',  // The Super Mario Bros. Movie
            'tt10545296', // The Flash
            'tt15789038', // Guardians of the Galaxy Vol. 3
            'tt8589698'   // Dune: Part Two
        ];

        const moviesWithDetails = await Promise.all(
            upcomingMovieIds.map(async id => {
                const response = await fetch(`${OMDB_BASE_URL}/?i=${id}&apikey=${OMDB_API_KEY}`);
                return await response.json();
            })
        );

        displayComingSoon(moviesWithDetails);
    } catch (error) {
        console.error('Error fetching coming soon movies:', error);
    }
}

function displayComingSoon(movies) {
    const comingSoonGrid = document.getElementById('coming-soon-grid');
    
    comingSoonGrid.innerHTML = movies.map(movie => `
        <div class="movie-card coming-soon-card">
            <div class="movie-card-image">
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450'}" 
                     alt="${movie.Title}">
                <div class="movie-card-overlay">
                    <div class="rating">
                        <i class="fas fa-calendar"></i>
                        <span>Coming Soon</span>
                    </div>
                    <div class="card-buttons">
                        <button class="view-details-btn" onclick="openMovieModal('${movie.imdbID}')">
                            <i class="fas fa-info-circle"></i> Details
                        </button>
                        <button class="notify-btn" onclick="setReminder('${movie.imdbID}', '${movie.Title}')">
                            <i class="fas fa-bell"></i> Notify Me
                        </button>
                    </div>
                </div>
            </div>
            <div class="movie-card-content">
                <h3>${movie.Title}</h3>
                <p class="release-date">Release: ${movie.Released}</p>
                <div class="genre-tags">
                    ${movie.Genre.split(',').map(genre => 
                        `<span class="genre-tag">${genre.trim()}</span>`
                    ).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Add reminder functionality
function setReminder(movieId, movieTitle) {
    // You can implement email/notification subscription here
    showToast(`You'll be notified when "${movieTitle}" releases!`);
}

// Paystack Integration
function initializePayment(email, amount) {
    let handler = PaystackPop.setup({
        key: process.env.PUBLIC_KEY, // Replace with your Paystack public key
        email: email,
        amount: Math.round(amount * 100), // Convert to kobo
        currency: 'NGN',
        ref: 'CIN_' + Math.floor((Math.random() * 1000000000) + 1),
        callback: function(response) {
            if (response.status === 'success') {
                handlePaymentSuccess(response.reference);
            }
        },
        onClose: function() {
            showToast('Transaction cancelled');
        }
    });
    handler.openIframe();
}

// Handle successful payment
function handlePaymentSuccess(reference) {
    showToast('Payment successful! Reference: ' + reference);
    clearCart();
    checkoutModal.style.display = 'none';
    
    // Show success animation
    const successModal = document.createElement('div');
    successModal.className = 'success-modal';
    successModal.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <h2>Payment Successful!</h2>
            <p>Your tickets have been booked successfully.</p>
            <p>Reference: ${reference}</p>
        </div>
    `;
    document.body.appendChild(successModal);

    setTimeout(() => {
        successModal.remove();
    }, 3000);
}

// Show success modal
function showSuccessModal(reference) {
    const successModal = document.createElement('div');
    successModal.className = 'success-modal';
    successModal.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <h2>Payment Successful!</h2>
            <p>Your tickets have been booked successfully.</p>
            <p>Reference: ${reference}</p>
        </div>
    `;
    document.body.appendChild(successModal);

    setTimeout(() => {
        successModal.remove();
    }, 3000);
}

// Update the checkout form submission
document.getElementById('checkout-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const totalAmount = parseFloat(document.getElementById('cart-total').textContent.replace('₦', ''));

    if (!email) {
        showToast('Please enter your email address');
        return;
    }

    if (!totalAmount || totalAmount <= 0) {
        showToast('Your cart is empty');
        return;
    }

    initializePayment(email, totalAmount);
});

// Helper function to clear cart
function clearCart() {
    cart = [];
    updateCart();
}

// Helper function to close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Helper function to show toast messages
function showToast(message) {
    // Create toast element if it doesn't exist
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }

    // Set message and show toast
    toast.textContent = message;
    toast.classList.add('show');

    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Add toast styles to your CSS

// Watch Trailer Functionality
function openTrailer(videoId) {
    const trailerModal = document.createElement('div');
    trailerModal.className = 'trailer-modal';
    trailerModal.innerHTML = `
        <div class="trailer-content">
            <button class="close-trailer">&times;</button>
            <iframe 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        </div>
    `;
    document.body.appendChild(trailerModal);
    trailerModal.style.display = 'block';

    // Close trailer
    const closeBtn = trailerModal.querySelector('.close-trailer');
    closeBtn.onclick = () => {
        trailerModal.remove();
    };

    // Close on outside click
    trailerModal.onclick = (e) => {
        if (e.target === trailerModal) {
            trailerModal.remove();
        }
    };
}