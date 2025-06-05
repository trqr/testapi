export function renderFilmPage(filmData){
    document.querySelector('.main-container').innerHTML = `
        <div class="card cell">
            <div class="card-image">
                <figure class="image">
                <img
                    src="https://image.tmdb.org/t/p/w500${filmData.poster_path}"
                    alt="${filmData.original_title}"
                />
                </figure>
            </div>
            <div class="card-content">
                <div class="media">
                <div class="media-left">
                    <figure class="image is-48x48">
                    <img
                        src="https://image.tmdb.org/t/p/w500${filmData.backdrop_path}"
                        alt="Placeholder image"
                    />
                    </figure>
                </div>
                <div class="media-content">
                    <p class="title is-4">${filmData.vote_count}</p>
                    <p class="subtitle is-6">${filmData.vote_average}</p>
                </div>
                </div>

                <div class="content">
                ${filmData.overview}
                <br />
                <time datetime="${filmData.release_date}">${filmData.release_date}</time>
                </div>
            </div>
        </div>
    `
}


