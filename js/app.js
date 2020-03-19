/* 
Attendre le chargement du DOM
*/
document.addEventListener('DOMContentLoaded', () => {

    /* 
    Déclarations
    */
        const searchForm = document.querySelector('header form#searchForm');
        const searchLabel = document.querySelector('header form#searchForm span');
        const searchData = document.querySelector('[name="searchData"]');
        const themoviedbUrl = 'https://api.themoviedb.org/3/search/movie?api_key=6fd32a8aef5f85cabc50cbec6a47f92f&query=';
        const movieList = document.querySelector('#movieList');
        const moviePopin = document.querySelector('#moviePopin article');
    //

    /* 
    Fonctions
    */
        const getSearchSumbit = () => {
            searchForm.addEventListener('submit', event => {
                // Stop event propagation
                event.preventDefault();

                // Check form data
                searchData.value.length > 0 
                ? fetchFunction(searchData.value) 
                : displayError(searchData, 'Minimum 1 caractère');

                let searchResult = document.querySelector('#resultSearch');
                searchResult.innerHTML = `Résultat de la recherche pour : ${searchData.value} <br>`;
                addSearchArchive(searchData.value);
                displayArchive();
            });
        };

        const displayError = (tag, msg) => {
            searchLabel.textContent = msg;
            tag.addEventListener('focus', () => searchLabel.textContent = '');
        };

        const fetchFunction = (keywords, index = 1) => {
            
            let fetchUrl = null;

            typeof keywords === 'number' 
            ? fetchUrl = `https://api.themoviedb.org/3/movie/${keywords}?api_key=6fd32a8aef5f85cabc50cbec6a47f92f`
            : fetchUrl = themoviedbUrl + keywords + '&page=' + index


            fetch( fetchUrl )
            .then( response => response.ok ? response.json() : 'Response not OK' )
            .then( jsonData => {
                typeof keywords === 'number' 
                ? displayPopin(jsonData)
                : displayMovieList(jsonData.results)
            })
            .catch( err => console.error(err) );
        };

        const displayMovieList = collection => {
            searchData.value = '';
            movieList.innerHTML = '';

            console.log(collection)
            for( let i = 0; i < collection.length; i++ ){
                movieList.innerHTML += `
                    <article>
                        <figure>
                            <img class="img img-fluid" src="https://image.tmdb.org/t/p/w300/${collection[i].poster_path}" alt="${collection[i].original_title}">
                            <figcaption movie-id="${collection[i].id}">
                                ${collection[i].original_title} (voir plus...)
                            </figcaption>
                        </figure>
                        <div class="overview">
                            <div>
                                <p>${collection[i].overview}</p>
                                <button>Voir le film</button>
                            </div>
                        </div>
                    </article>
                `;
            };

            getPopinLink( document.querySelectorAll('figcaption') );
        };

        const getPopinLink = linkCollection => {
            for( let link of linkCollection ){
                link.addEventListener('click', () => {
                    // +var = parseInt(var) || parseFloat(var)
                    fetchFunction( +link.getAttribute('movie-id') );
                });
            };
        };

        const displayPopin = data => {
            console.log(data);
            moviePopin.style.display = 'flex'
            moviePopin.parentElement.classList.add('open')
            moviePopin.innerHTML = `
                <div>
                    <img class="img img-fluid" src="https://image.tmdb.org/t/p/w300/${data.poster_path}" alt="${data.original_title}">
                </div>

                <div>
                    <h2>${data.original_title}</h2>
                    <p>${data.overview}</p>
                    <div class="d-flex flex-column w-100 justify-content-around">
                        <button class="btn btn-light mt-1"><i class="fas fa-video mr-2"></i>Voir en streaming</button>
                        <button class="addFilm btn btn-light mt-1" film-id=${data.id} film-title="${data.original_title}"><i class="fas fa-bookmark mr-2"></i>Ajouter en favori</button>
                        <button id="closeButton" class="btn btn-light mt-1"><i class="fas fa-window-close mr-2"></i>Close</button>
                    </div>
                </div>
            `;

            moviePopin.parentElement.classList.add('open');
            closePopin( document.querySelector('#closeButton') )
            addFavori(document.querySelectorAll('.addFilm'));
        };

        const closePopin = button => {
            button.addEventListener('click', () => {
                moviePopin.style.display = 'none';
                moviePopin.parentElement.classList.remove('open')
            })
        }

        const addFavori = (btnList) => {
            let filmToAdd = {};
            let config = {};
            let authorValue = localStorage.getItem("user");
            let idFilmValue = null;
            let nameFilmValue = null;

            for(let btn of btnList){
                btn.addEventListener('click', ()=>{
                    idFilmValue = btn.getAttribute('film-id');
                    nameFilmValue = btn.getAttribute('film-title')
                    filmToAdd = {
                        author: authorValue,
                        id: idFilmValue,
                        title: nameFilmValue
                    }
                    config = {
                        method: 'POST',
                        body: JSON.stringify(filmToAdd),
                        headers: { 'Content-Type': 'application/json' }
                    }
                    if(authorValue !== null){
                      fetchFavorite(config)  
                    }else{
                        console.log('merci de vous connecter')
                    }
                })
            }
        }

        const fetchFavorite = (fetchData) => {
            fetch('https://api.dwsapp.io/api/favorite', fetchData)
            .then(response => {
                return response.json(); 
            })
            .then(jsonData => {
                console.log(jsonData);
            })
            .catch(error=>{
                console.log(error);
            })
        }

        const fetchDefaultMovie = () => {
            let config = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json'}
            }
            fetch("https://api.themoviedb.org/3/discover/movie?api_key=fdafddd9077186cd8fe272534e4ccd71",config)
            .then(response => {
                return response.json();
            })
            .then(jsonData => {
                console.log(jsonData)
                displayDefaultMovie(jsonData.results)
            })
            .catch(error => {
                console.log(error)
            })
        }
        const displayDefaultMovie = (collection) => {
            console.log(collection)
            for( let i = 0; i < collection.length; i++ ){
                movieList.innerHTML += `
                    <article>
                        <figure>
                            <img class="img img-fluid" src="https://image.tmdb.org/t/p/w300/${collection[i].poster_path}" alt="${collection[i].original_title}">
                            <figcaption movie-id="${collection[i].id}">
                                ${collection[i].original_title} (voir plus...)
                            </figcaption>
                        </figure>
                        <div class="overview">
                            <div>
                                <p>${collection[i].overview}</p>
                                <button>Voir le film</button>
                            </div>
                        </div>
                    </article>
                `;
            };
            getPopinLink( document.querySelectorAll('figcaption') );
        }
        
        const addSearchArchive = (data) => {
            let searchValue = '';
            if(localStorage.getItem("search")){
                searchValue = localStorage.getItem("search");
                searchValue += `${data},`;
            } else {
                searchValue += `${data},`;
            }
            localStorage.setItem("search", searchValue);
        }

        const displayArchive = () => {
            let lastSearch = document.querySelector('#lastSearch');
            lastSearch.innerHTML = '<h6>Vos dernières recherche : </h6>';
            let archive = null;
            let tab = [];
            if(localStorage.getItem("search")){
                archive = localStorage.getItem("search");
                tab = archive.split(',');
                for(let histo of tab){
                    lastSearch.innerHTML += `
                        <p class="m-1">${histo} </p>
                    `;
                }  
            }  
        }
    //

    /* 
    Lancer IHM
    */
        fetchDefaultMovie();
        displayArchive();
        getSearchSumbit();
    //
});