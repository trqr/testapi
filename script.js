import * as filmPage from './renderFilmPage.js'

export let currentFilm = [];
let fetchedData = [];
let allMoviesData = [];
let compteurPage = 1;

function renderCards(){

let html = ""

allMoviesData.forEach(element => {
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
            <button class="button film-button" data-id="${element.id}">Plus d'infos</button>
            </div>
        
        </div>
    </div>
    `
});
    document.querySelector('.cards-container').innerHTML = html;
    ListeningFilmButtonsAndFetching();
};

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNjJhMzBiMzIwMDc4OTc3YzQ5ODg1MTk3ZmIwYzE0ZSIsIm5iZiI6MTc0NDQ2NDcwMi40NjUsInN1YiI6IjY3ZmE2YjNlZDNhYjdkN2E4YmFkZGFlYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Xb9GpGoRsKOQ2pIdndHarxCMUHzlD6oc2uxjz9QxHg0'
  }
};

function fetchingAndRendering(url){
    fetch(url, options)
        .then(res => res.json())
        .then(res => {
            fetchedData = res.results;
            fetchedData.forEach(movie => allMoviesData.push(movie))
            console.log('Data stored in variable:', allMoviesData);
            renderCards()
        })
        .catch(err => console.error(err));
    }

fetchingAndRendering('https://api.themoviedb.org/3/movie/popular?language=en-US&page=1')

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

            compteurPage++;
            fetchingAndRendering(`https://api.themoviedb.org/3/movie/popular?language=en-US&page=${compteurPage}`)
            
            loadingToast.classList.remove('is-hidden');
            setTimeout(() => {
                loadingToast.classList.add('is-hidden');
            }, 2000);
        }
    }
});

if (window.location.pathname.endsWith('film.html')) {
    loadFilmPage();
}