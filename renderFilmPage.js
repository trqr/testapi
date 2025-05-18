import { currentFilm } from "./script.js"

export function renderFilmPage(){
    document.querySelector('.cards-container').innerHTML = `
        <div class="card cell">
            <div class="card-image">
                <figure class="image">
                <img
                    src="https://image.tmdb.org/t/p/w500${currentFilm.poster_path}"
                    alt="${currentFilm.original_title}"
                />
                </figure>
            </div>
            <div class="card-content">
                <div class="media">
                <div class="media-left">
                    <figure class="image is-48x48">
                    <img
                        src="https://image.tmdb.org/t/p/w500${currentFilm.backdrop_path}"
                        alt="Placeholder image"
                    />
                    </figure>
                </div>
                <div class="media-content">
                    <p class="title is-4">${currentFilm.vote_count}</p>
                    <p class="subtitle is-6">${currentFilm.vote_average}</p>
                </div>
                </div>

                <div class="content">
                ${currentFilm.overview}
                <br />
                <time datetime="${currentFilm.release_date}">${currentFilm.release_date}</time>
                </div>
            </div>
        </div>
    `
}


