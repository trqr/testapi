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
    fetch(`https://api.themoviedb.org/3/movie/${filmId}?language=en-US`, options)
        .then(res => res.json())
        .then(res => {
            currentFilm = res;
            console.log('Data stored in variable:', currentFilm);
            // rediriger ou afficher la fiche ici
        })
        .catch(err => console.error(err));
}
window.fetchingAndGoingToFilmPage = fetchingAndGoingToFilmPage;

function ListeningFilmButtonsAndFetching(){
    const buttons = document.querySelectorAll('.film-button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const filmId = button.dataset.id;
            fetchingAndGoingToFilmPage(filmId)
            console.log(currentFilm);
            filmPage.renderFilmPage();
        });
    });
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