import * as filmPage from './renderFilmPage.js'

export let currentFilm = [];
// let fetchedData = []; // Removed
let allMoviesData = [];
let movieGenres = [];
let topPopularMovies = [];
let compteurPage = 1; // Should be 1 as it's often used as the initial page
let currentApiParams = { query: null, genreId: null };

function renderCards(moviesToRender) {
    const cardsContainer = document.querySelector('.cards-container');
    if (!cardsContainer) {
        console.error("Cards container not found!");
        return;
    }
    cardsContainer.innerHTML = ''; // Clear existing cards

    let html = "";
    moviesToRender.forEach(element => {
    html += 
    `
    <div class="card">
        <div class="card-image">
            <figure class="image">
            <img
                src="https://image.tmdb.org/t/p/w500${element.poster_path}"
                alt="${element.original_title}"
            />
            </figure>
        </div>
        <div class="card-content">
            <div class="media">
            <div class="media-left">
                <figure class="image is-48x48">
                <img
                    src="https://image.tmdb.org/t/p/w500${element.backdrop_path}"
                    alt="Placeholder image"
                />
                </figure>
            </div>
            <div class="media-content">
                <p class="title is-4">${element.original_title}</p>
                <p class="subtitle is-6">${element.release_date}</p>
            </div>
            </div>

            <div class="content">
            ${element.overview}
            <br />
            <time datetime="${element.release_date}">${element.release_date}</time>
            <button class="button film-button" data-id="${element.id}" style="margin-top: 0.5rem;">Plus d'infos</button>
            <button class="button is-small like-button" data-movie-id="${element.id}" aria-label="Like ${element.original_title}" style="margin-top: 0.5rem;">
              <span class="icon is-small"><i class="fas fa-heart"></i></span>
              <span>Like</span>
            </button>
            </div>
        
        </div>
    </div>
    `
});
    cardsContainer.innerHTML = html;
    ListeningFilmButtonsAndFetching();
}

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNjJhMzBiMzIwMDc4OTc3YzQ5ODg1MTk3ZmIwYzE0ZSIsIm5iZiI6MTc0NDQ2NDcwMi40NjUsInN1YiI6IjY3ZmE2YjNlZDNhYjdkN2E4YmFkZGFlYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Xb9GpGoRsKOQ2pIdndHarxCMUHzlD6oc2uxjz9QxHg0'
  }
};

function buildApiUrl(page = 1) {
    const baseUrl = 'https://api.themoviedb.org/3';
    let endpoint = '/movie/popular';
    const queryParams = new URLSearchParams({ language: 'en-US', page: page.toString() });

    if (currentApiParams.query) {
        endpoint = '/search/movie';
        queryParams.set('query', currentApiParams.query);
    } else if (currentApiParams.genreId) {
        endpoint = '/discover/movie';
        queryParams.set('with_genres', currentApiParams.genreId);
        queryParams.set('sort_by', 'popularity.desc');
    }
    // If neither query nor genreId, it defaults to popular movies as endpoint is pre-set.
    return `${baseUrl}${endpoint}?${queryParams.toString()}`;
}

async function fetchMovies(page = 1, isLoadMore = false) {
    const url = buildApiUrl(page);
    // console.log(`Fetching URL: ${url}`);
    const loadingToast = document.querySelector('.loading-toast'); // For load more
    if (isLoadMore && loadingToast) loadingToast.classList.remove('is-hidden');

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const newMovies = data.results;

        if (!newMovies || newMovies.length === 0) {
            if (!isLoadMore) {
                // This means it's a new search/filter with no results
                allMoviesData = []; // Clear existing data
                renderCards(allMoviesData); // Render empty state (or a message)
                console.log('No movies found for the current criteria.');
                // Optionally, display a "No results found" message in cardsContainer
                const cardsContainer = document.querySelector('.cards-container');
                if (cardsContainer) cardsContainer.innerHTML = '<p class="has-text-centered">No movies found matching your criteria.</p>';
            } else {
                // No more movies to load for current criteria
                console.log('No more movies to load.');
                 if(loadingToast) loadingToast.innerHTML = "No more movies to load."; // Inform user
            }
            if (loadingToast && !isLoadMore) loadingToast.classList.add('is-hidden'); // Hide if it was a fresh load
            return; // Exit if no new movies
        }

        if (isLoadMore) {
            allMoviesData.push(...newMovies);
        } else {
            allMoviesData = newMovies;
            compteurPage = 1; // Reset page counter for a new dataset
        }

        renderCards(allMoviesData);
        console.log('Data stored in variable:', allMoviesData);
        // compteurPage should reflect the page number that was just fetched and rendered.
        // For a new load (isLoadMore = false), page is 1.
        // For load more, page is the next page number.
        // The global compteurPage will be updated by the caller for isLoadMore cases.
        // For new loads, it's reset to 1 above.
        // Let's ensure compteurPage is correctly reflecting the *last successfully loaded page*
        // for the current dataset.
        // No, the logic is: if isLoadMore is false, compteurPage is reset to 1.
        // If isLoadMore is true, the calling function (scroll listener) has already incremented compteurPage.
        // So this function doesn't need to set compteurPage if isLoadMore is true.
        // It *does* set it to 1 if isLoadMore is false.
        // The parameter 'page' is the page that was *requested*.

    } catch (error) {
        console.error('Error fetching movies:', error);
        // Optionally, display an error message to the user
        const cardsContainer = document.querySelector('.cards-container');
        if (cardsContainer && !isLoadMore) cardsContainer.innerHTML = '<p class="has-text-centered">Error loading movies. Please try again later.</p>';
    } finally {
        if (isLoadMore && loadingToast) {
             setTimeout(() => { // Keep the "no more movies" message if applicable
                if (loadingToast.innerHTML !== "No more movies to load."){
                    loadingToast.classList.add('is-hidden');
                }
            }, 2000);
        }
    }
}

async function fetchGenres() {
    const genreUrl = 'https://api.themoviedb.org/3/genre/movie/list?language=en';
    try {
        const response = await fetch(genreUrl, options);
        if (response.ok) {
            const data = await response.json();
            movieGenres = data.genres;
            console.log('Movie genres fetched and stored:', movieGenres);
            return true;
        } else {
            console.error('Error fetching genres:', response.status, response.statusText);
            return false;
        }
    } catch (error) {
        console.error('Error fetching genres:', error);
        return false;
    }
}

function renderGenreChips() {
    const chipsContainer = document.getElementById('filter-chips-container');
    if (chipsContainer && movieGenres && movieGenres.length > 0) {
        chipsContainer.innerHTML = ''; // Clear existing chips
        movieGenres.forEach(genre => {
            const chip = document.createElement('a');
            chip.classList.add('button', 'is-light', 'is-rounded');
            chip.textContent = genre.name;
            chip.dataset.genreId = genre.id;
            // chip.style.marginRight = '0.5em'; // Removed
            // chip.style.marginBottom = '0.5em'; // Removed

            chip.addEventListener('click', () => {
                // 1. Toggle active visual state
                chip.classList.toggle('is-info');
                chip.classList.toggle('is-light');

                // 2. Collect all active genre IDs
                const selectedGenreIds = [];
                const allChips = chipsContainer.querySelectorAll('.button'); // Query within chipsContainer
                allChips.forEach(c => {
                    if (c.classList.contains('is-info')) { // Check for the active class
                        selectedGenreIds.push(c.dataset.genreId);
                    }
                });

                // 3. Update currentApiParams
                if (selectedGenreIds.length > 0) {
                    currentApiParams.genreId = selectedGenreIds.join(','); // Comma-separated for AND logic
                    currentApiParams.query = null; // Clear search query

                    // Clear search input field
                    const searchInput = document.getElementById('search-input');
                    if (searchInput) {
                        searchInput.value = '';
                    }
                    // console.log(`Filtering by genres: ${currentApiParams.genreId}`);
                } else {
                    // No genres selected, revert to popular or default state
                    currentApiParams.genreId = null;
                    currentApiParams.query = null; // Ensure search is also cleared
                    // console.log("No genres selected, fetching popular movies.");
                }

                // 4. Fetch movies with new filter
                fetchMovies(1, false);
            });
            chipsContainer.appendChild(chip);
        });
    } else {
        if (!chipsContainer) console.log("Filter chips container not found.");
        if (!movieGenres || movieGenres.length === 0) console.log("Movie genres not available or empty.");
    }
}

function fetchingAndGoingToFilmPage(filmId) {
    return fetch(`https://api.themoviedb.org/3/movie/${filmId}?language=en-US`, options)
        .then(res => res.json())
        .then(res => {
            currentFilm = res; // Still update global currentFilm for other potential uses
            console.log('Data stored in variable:', currentFilm);
            return res; // Return the fetched data
        })
        .catch(err => {
            console.error(err);
            return null; // Return null or throw error on failure
        });
}
window.fetchingAndGoingToFilmPage = fetchingAndGoingToFilmPage;

function ListeningFilmButtonsAndFetching(){
    const buttons = document.querySelectorAll('.film-button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const filmId = button.dataset.id;
            //fetchingAndGoingToFilmPage(filmId) // This call is not needed here anymore as we navigate
            //console.log(currentFilm); // currentFilm would not be updated yet anyway
            window.location.href = `film.html?id=${filmId}`;
        });
    });
}

async function loadFilmPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const filmId = urlParams.get('id');

    if (filmId) {
        const filmData = await fetchingAndGoingToFilmPage(filmId);
        if (filmData) {
            filmPage.renderFilmPage(filmData);

            // Delegated event listener for "Like" button on film.html
            const mainDetailContainer = document.querySelector('.main-container');
            if (mainDetailContainer) {
                mainDetailContainer.addEventListener('click', function(event) {
                    const likeButton = event.target.closest('.like-button');
                    if (likeButton) {
                        handleLikeButtonClick(event);
                    }
                });
            }

            // Setup modal control event listeners for Register Modal (on film.html)
            const registerModalCloseButtonFilm = document.getElementById('register-modal-close-button');
            if (registerModalCloseButtonFilm) {
                registerModalCloseButtonFilm.addEventListener('click', () => toggleModal('register-modal'));
            }

            const registerModalCancelButtonFilm = document.getElementById('register-modal-cancel-button');
            if (registerModalCancelButtonFilm) {
                registerModalCancelButtonFilm.addEventListener('click', () => toggleModal('register-modal'));
            }

            const registerModalBackgroundFilm = document.querySelector('#register-modal .modal-background');
            if (registerModalBackgroundFilm) {
                registerModalBackgroundFilm.addEventListener('click', () => toggleModal('register-modal'));
            }

        } else {
            // Handle case where film data could not be fetched
            console.error('Failed to load film data.');
            // Optionally redirect or show an error message
            // window.location.href = 'index.html';
        }
    } else {
        console.error('No film ID found in URL.');
        // Optionally redirect to index.html or show a message
        // window.location.href = 'index.html';
    }
}

window.addEventListener('scroll', function() {
    const loadingToast = document.querySelector('.loading-toast')
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 30) {
        if (loadingToast.classList.contains('is-hidden')) {

            compteurPage++; // Increment current page
            fetchMovies(compteurPage, true); // Fetch next page, append results
            
            // Loading toast logic is now partially inside fetchMovies for isLoadMore=true
            // but the initial show can be here if needed, or rely on fetchMovies to show it.
            // fetchMovies shows it, so we might not need to explicitly show it here.
            // Let's remove the direct manipulation of loadingToast from here as fetchMovies handles it.
            // However, the original logic showed it *before* fetch, now fetchMovies shows it *during* fetch.
            // For a better UX, show it immediately.
            const loadingToastInstance = document.querySelector('.loading-toast');
            if(loadingToastInstance) loadingToastInstance.classList.remove('is-hidden');
            // fetchMovies will hide it or change its text.
        }
    }
});

if (window.location.pathname.endsWith('film.html')) {
    loadFilmPage();
} else {
    // This else block ensures this code only runs on index.html or other non-film.html pages
    async function initializeIndexPage() {
        const popularFetched = await fetchTopPopularMovies(); // Fetch top popular for carousel
        if (popularFetched) {
            renderCarousel();
        }
        const genresFetched = await fetchGenres();
        if (genresFetched) {
            renderGenreChips();
        }
        // Now fetch initial popular movies. compteurPage is 1 by default.
        fetchMovies(compteurPage); // This will internally use page 1 and isLoadMore=false

        // Setup search event listeners
        const searchButton = document.getElementById('search-button');
        if (searchButton) {
            searchButton.addEventListener('click', handleSearch);
        }

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    handleSearch();
                }
            });
        }

        // Setup modal control event listeners for Sign-In Modal
        const navbarLoginButton = document.getElementById('navbar-login-button');
        if (navbarLoginButton) {
            navbarLoginButton.addEventListener('click', (event) => {
                event.preventDefault(); // It's an <a> tag
                toggleModal('signin-modal');
            });
        }

        const signinModalCloseButton = document.getElementById('signin-modal-close-button');
        if (signinModalCloseButton) {
            signinModalCloseButton.addEventListener('click', () => toggleModal('signin-modal'));
        }

        const signinModalCancelButton = document.getElementById('signin-modal-cancel-button');
        if (signinModalCancelButton) {
            signinModalCancelButton.addEventListener('click', () => toggleModal('signin-modal'));
        }

        const signinModalBackground = document.querySelector('#signin-modal .modal-background');
        if (signinModalBackground) {
            signinModalBackground.addEventListener('click', () => toggleModal('signin-modal'));
        }

        // Setup modal control event listeners for Register Modal (on index.html)
        const registerModalCloseButtonIndex = document.getElementById('register-modal-close-button');
        if (registerModalCloseButtonIndex) {
            registerModalCloseButtonIndex.addEventListener('click', () => toggleModal('register-modal'));
        }

        const registerModalCancelButtonIndex = document.getElementById('register-modal-cancel-button');
        if (registerModalCancelButtonIndex) {
            registerModalCancelButtonIndex.addEventListener('click', () => toggleModal('register-modal'));
        }

        const registerModalBackgroundIndex = document.querySelector('#register-modal .modal-background');
        if (registerModalBackgroundIndex) {
            registerModalBackgroundIndex.addEventListener('click', () => toggleModal('register-modal'));
        }

        // Delegated event listeners for "Like" buttons on index.html
        const cardsContainer = document.querySelector('.cards-container');
        if (cardsContainer) {
            cardsContainer.addEventListener('click', function(event) {
                const likeButton = event.target.closest('.like-button');
                if (likeButton) {
                    handleLikeButtonClick(event);
                }
            });
        }

        const carouselContainer = document.getElementById('top-movies-carousel');
        if (carouselContainer) {
            carouselContainer.addEventListener('click', function(event) {
                const likeButton = event.target.closest('.like-button');
                if (likeButton) {
                    handleLikeButtonClick(event);
                }
            });
        }
    }
    initializeIndexPage();
}

// General modal toggle function
function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.toggle('is-active');
    } else {
        console.error(`Modal with ID '${modalId}' not found.`);
    }
}
// function toggleSignInModal() { // Removed as toggleModal is now generic
//     const modal = document.getElementById('signin-modal');
//     if (modal) {
//         modal.classList.toggle('is-active');
//     }
// }

function renderCarousel() {
    const carouselContainer = document.getElementById('top-movies-carousel');
    if (!carouselContainer) {
        console.error('Carousel container #top-movies-carousel not found.');
        return;
    }
    if (!topPopularMovies || topPopularMovies.length === 0) {
        console.log('No top popular movies to render in carousel.');
        carouselContainer.innerHTML = '<p class="has-text-centered">Could not load top movies.</p>'; // Or keep it empty
        return;
    }

    carouselContainer.innerHTML = ''; // Clear any existing content

    topPopularMovies.forEach(movie => {
        const item = document.createElement('div');
        item.classList.add('carousel-item');

        const posterUrl = movie.poster_path
            ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
            : 'https://via.placeholder.com/300x450.png?text=No+Image';

        item.innerHTML = `
            <figure class="image is-2by3">
              <img src="${posterUrl}" alt="${movie.title}">
            </figure>
            <p class="carousel-item-title has-text-centered is-size-7">${movie.title}</p>
            <button class="button is-small is-fullwidth like-button" data-movie-id="${movie.id}" aria-label="Like ${movie.title}">
              <span class="icon is-small"><i class="fas fa-heart"></i></span>
              <span>Like</span>
            </button>
        `;
        carouselContainer.appendChild(item);
    });
}

function handleLikeButtonClick(event) {
    // event.preventDefault(); // Usually not needed for <button type="button">
    const likeButton = event.target.closest('.like-button');
    // The check for likeButton is implicitly handled by event.target.closest,
    // but an explicit check doesn't hurt if we want to be super sure or add specific logic if it's not found.
    if (!likeButton) return;

    const movieId = likeButton.dataset.movieId;
    console.log(`Like button clicked for movie ID: ${movieId}`);

    // For now, always open the register modal
    toggleModal('register-modal');
}

function handleSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();

    // Clear active state of any genre chips
    const activeChips = document.querySelectorAll('#filter-chips-container .button.is-info');
    activeChips.forEach(chip => {
        chip.classList.remove('is-info');
        chip.classList.add('is-light'); // Reset to default style
    });

    if (query === "") {
        currentApiParams.query = null;
        currentApiParams.genreId = null; // Clear genre filter as well
        // console.log("Empty search query, fetching popular movies.");
    } else {
        currentApiParams.query = query;
        currentApiParams.genreId = null; // New search overrides genre filter
        // console.log(`Searching for query: ${query}`);
    }
    fetchMovies(1, false); // Fetch page 1 of new results (not loading more)
}

async function fetchTopPopularMovies(count = 10) {
    const url = 'https://api.themoviedb.org/3/movie/popular?language=en-US&page=1';
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            console.error('Error fetching top popular movies:', response.status, response.statusText);
            return false;
        }
        const data = await response.json();
        topPopularMovies = data.results.slice(0, count);
        console.log('Top popular movies fetched:', topPopularMovies);
        return true;
    } catch (error) {
        console.error('Error fetching top popular movies:', error);
        return false;
    }
}