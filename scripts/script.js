import api from './api.js';
import random from './random.js';

let allMovies = [];
let loadingImg = document.querySelector('.loading');
let favMovies = JSON.parse(localStorage.getItem('favMovies')) || [];
console.log(favMovies);
favMovies.forEach(movie => {
    renderFavoriteMovies(movie);
});

window.addEventListener('load', () => {
    console.log('load');
    document.querySelector('.searchedMovies').classList.add('d-none');
    document.querySelector('.favoriteMovies').classList.add('d-none');
    loadingImg.classList.add('d-none');
    //Förslagsvis anropar ni era funktioner som skall sätta lyssnare, rendera objekt osv. härifrån
    randomMovieTitle();
    topMovies();
    carousel();
    document.querySelector('#btnRandom').addEventListener('click', randomMovieTitle);
    document.querySelector('#searchBtn').addEventListener('click', getMovie);
    document.querySelector('#btnStart').addEventListener('click', startPage);
    document.querySelector('#btnFav').addEventListener('click', favoritePage);
});

function startPage() {
    window.scrollTo(0,0)
    document.querySelector('.asideNav').classList.add('menuClose');
    document.querySelector('.searchedMovies').classList.add('d-none');
    document.querySelector('.topMovies').classList.remove('d-none');
    document.querySelector('.favoriteMovies').classList.add('d-none');
    randomMovieTitle();
    updateCarousel();
}

/* Läser in Jespers API och för varje film så skapar vi en ny artikel som inkluderar poster och titel och lägger ut det på sidan */
async function topMovies() {
    try {
        let movies = await api.getApi('https://santosnr6.github.io/Data/movies.json');

        movies.forEach(movie => {
            const mainRef = document.querySelector('.topWrapper');
            const poster = document.createElement('article');
            const posterImg = document.createElement('img');
            const heart = document.createElement('i');
            const heartBtn = document.createElement('button');
            heartBtn.classList.add('heartBtn');
            heart.classList.add('fa-regular', 'fa-heart', 'heart');
            const title = document.createElement('h2');
            poster.classList.add('moviePosterContainer');
            title.classList.add('movieTitle');
            posterImg.classList.add('moviePoster');
            poster.setAttribute('data-id', movie.imdbid);
            title.textContent = movie.title;
            posterImg.src = movie.poster;
            posterImg.alt = 'A poster of to the movie: ' + movie.title;
            heartBtn.appendChild(heart);
            poster.appendChild(heartBtn);
            poster.appendChild(posterImg);
            poster.appendChild(title);
            mainRef.appendChild(poster);

            heartBtn.addEventListener('click', event => {
                if(heart.classList.contains('fa-regular')) {
                    addFavoriteMovie(event);
                    console.log('Nu ska filmen adderas');
                } else {
                    removeFavoriteMovies(event);
                    console.log('Nu ska filmen raderas');
                }
            });
            
            favMovies.forEach(favMovies => {
                if(movie.imdbid === favMovies.imdbID) {
                    heart.classList.remove('fa-regular');
                    heart.classList.add('fa-solid');
                }
            });
        });

        let allPosters = document.querySelectorAll('.moviePoster');
        allPosters.forEach(poster => {
            poster.addEventListener('click', getMoreInfoAboutMovies);
        });

    } catch (error) {
        console.log('Error in topMovies: ', error);
    }
}

async function carousel() {
    try {
        let movies = await api.getApi('https://santosnr6.github.io/Data/movies.json');
        let firstFiveMovies = shuffleArray(movies);

        firstFiveMovies.forEach(movie => {
            console.log(movie.title);
            const sliderRef = document.querySelector('.carousel');
            const slide = document.createElement('li')
            slide.classList.add('carouselSlide');
            const slideVideo = document.createElement('iframe');
            slideVideo.classList.add('carouselVideo');
            slideVideo.src = movie.trailer_link;
            slide.appendChild(slideVideo);
            sliderRef.appendChild(slide);
        });
} catch (error) { 
    console.log('Could not get information about the movies: ', error);
}

    let buttonPrev = document.querySelector('#btnPrev');
    let buttonNext = document.querySelector('#btnNext');
    let currentVideoIndex = 0;


    buttonNext.addEventListener('click', () => {
        let slides = document.querySelectorAll('.carouselSlide');
        currentVideoIndex = (currentVideoIndex + 1) % slides.length;
        slides.forEach(slide => {
            slide.style.display = 'none';
        });
        if (currentVideoIndex >= 0) {
            slides[currentVideoIndex].style.display = 'block';
        }
            console.log('Du räknar upp!');    
            console.log(currentVideoIndex);
    });

    buttonPrev.addEventListener('click', () => {
        let slides = document.querySelectorAll('.carouselSlide');
        if(currentVideoIndex === 0) {
            currentVideoIndex = slides.length-1;
        } else {
            currentVideoIndex--;
        }
        slides.forEach(slide => {
            slide.style.display = 'none';
        });
        if (currentVideoIndex >= 0) {
            slides[currentVideoIndex].style.display = 'block';
        }
        console.log('Du räknar ner!');
        console.log(currentVideoIndex);
    });
}

function updateCarousel() {
    let movies = document.querySelectorAll('.carouselSlide');
    movies.forEach(movie => {
        movie.remove();
    });
    carousel();
}

function shuffleArray(movieArray) {
    for(let i = movieArray.length - 1; i >= 0; i--){
        let randomNumber = Math.floor(Math.random() * (i + 1));
        let movieIndex = movieArray[i];
        movieArray[i] = movieArray[randomNumber];
        movieArray[randomNumber] = movieIndex;
    }
    return movieArray.slice(0, 5);
}
//Get the value from the input field and get the api from the function getApi in api.js
async function getMovie(event) {
    event.preventDefault();
    document.querySelector('.asideNav').classList.add('menuClose');
    window.scrollTo(0,0);
    loadingImg.classList.remove('d-none');
    document.querySelector('.topMovies').classList.add('d-none');
    document.querySelector('.searchedMovies').classList.remove('d-none');
    document.querySelector('.favoriteMovies').classList.add('d-none');
    let inputInfo = document.querySelector('#search').value.toLowerCase();

    if(inputInfo === '') {
        alert('Please enter a movie title');
        document.querySelector('.asideNav').classList.remove('menuClose');
        loadingImg.classList.add('d-none');
        document.querySelector('.topMovies').classList.remove('d-none');    
        document.querySelector('.searchedMovies').classList.add('d-none');
        return;
    }

    console.log(inputInfo);
    fetchPage(inputInfo);
}

async function fetchPage(inputInfo) {
    document.querySelector('#search').value = '';
    allMovies = [];

    try {
        let pageNumber = 1;
        let url = `http://www.omdbapi.com/?s=${inputInfo}&page=${pageNumber}&apikey=ce81fd7d`;
        let data;

        do {
            console.log(url);
            data = await api.getApi(url);
            data.Search.forEach(movie => {
                allMovies.push(movie);
            });

            pageNumber++;
            url = `http://www.omdbapi.com/?s=${inputInfo}&page=${pageNumber}&apikey=ce81fd7d`;
            console.log(allMovies);
            if(allMovies.length > 25) {
                break;
            }
        } while(data.totalResults > pageNumber * 10)
        loadingImg.classList.add('d-none');
        renderMovies();
    } catch (error) {
        console.log('Error while fetching movie informations from the different pages in the api: ', error);
        alert('Could not find any movies with that title. Try again')
        document.querySelector('#search').value = '';
        document.querySelector('.asideNav').classList.remove('menuClose');
        loadingImg.classList.add('d-none');
        document.querySelector('.topMovies').classList.remove('d-none');    
        document.querySelector('.searchedMovies').classList.add('d-none');
    }
}

function renderMovies() {
    const wrapper = document.querySelector('.searchedWrapper');
    wrapper.innerHTML = '';
    console.log(allMovies);

    let filterMovies = allMovies.filter(movie => movie.Type !== 'game' && movie.Poster !== 'N/A');
    filterMovies.forEach(movie => {
        const poster = document.createElement('article');
        const posterImg = document.createElement('img');
        const title = document.createElement('h2');
        const heart = document.createElement('i');
        const heartBtn = document.createElement('button');
        heart.classList.add('fa-regular', 'fa-heart', 'heart');
        heartBtn.classList.add('heartBtn');
        poster.classList.add('moviePosterContainer');
        title.classList.add('movieTitle');
        posterImg.classList.add('moviePoster');
        poster.setAttribute('data-id', movie.imdbID);
        title.textContent = movie.Title;
        posterImg.src = movie.Poster;
        posterImg.alt = 'A poster of to the movie: ' + movie.Title;
        heartBtn.appendChild(heart);
        poster.appendChild(heartBtn);
        poster.appendChild(posterImg);
        poster.appendChild(title);
        wrapper.appendChild(poster);
       
        heartBtn.addEventListener('click', event => {
            if(heart.classList.contains('fa-regular')) {
                addFavoriteMovie(event);
                console.log('Nu ska filmen adderas');
            } else {
                removeFavoriteMovies(event);
                console.log('Nu ska filmen raderas');
            }
        });

        favMovies.forEach(favMovies => {
            if(movie.imdbID === favMovies.imdbID) {
                heart.classList.remove('fa-regular');
                heart.classList.add('fa-solid');
            }
        });
    });

    let allPosters = document.querySelectorAll('.moviePoster');
    allPosters.forEach(poster => {
        poster.addEventListener('click', getMoreInfoAboutMovies);
    });
}

let isFetching = false;
let timeout;

async function getMoreInfoAboutMovies(event) {
    if(isFetching) {
        return;
    }
    isFetching = true;

    timeout = setTimeout(() => {
        loadingImg.classList.remove('d-none');
    }, 100);

    let movieId = event.target.parentElement.getAttribute('data-id');
    let movieInfo;

    try {
        movieInfo = await api.getApi('http://www.omdbapi.com/?i=' + movieId + '&apikey=ce81fd7d');
    } catch (error) { 
        console.log('Error while fetching more information about the movie: ', error);
    }
    console.log(movieInfo);
    renderMoreInfo(movieInfo);
}
//Funktion för att få fram mer information om varje enskild film
function renderMoreInfo(movieInfo) {
    clearTimeout(timeout);
    loadingImg.classList.add('d-none');
    let mainRef = document.querySelector('.mainContainer');
    let movieWrapper = document.createElement('div');
    movieWrapper.classList.add('movieContainer');
    let movieContainer = document.createElement('section');
    let movieInfoContent = document.createElement('section');
    movieContainer.classList.add('movieInfoContainer');
    movieInfoContent.classList.add('movieInfoContent');
    let closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.classList.add('closeBtn');
    let poster = document.createElement('img');
    let title = document.createElement('h2');
    let plot = document.createElement('p');
    let genre = document.createElement('p');
    let director = document.createElement('p');
    let actors = document.createElement('p');
    let language = document.createElement('p');
    let rating = document.createElement('p');

    poster.src = movieInfo.Poster;
    poster.alt = 'A poster of to the movie: ' + movieInfo.Title;
    title.textContent = `${movieInfo.Title}, ${movieInfo.Year}`;
    genre.textContent = `Genre: ${movieInfo.Genre}`;
    director.textContent = `Directed by: ${movieInfo.Director}`;
    actors.textContent = `Actors: ${movieInfo.Actors}`;
    language.textContent = `Language: ${movieInfo.Language}`;
    plot.textContent = `Movie Plot: ${movieInfo.Plot}`;
    rating.textContent = `Rating: ${movieInfo.imdbRating}`;

    movieContainer.appendChild(closeBtn);
    movieContainer.appendChild(poster);
    movieInfoContent.appendChild(title);
    movieInfoContent.appendChild(genre);
    movieInfoContent.appendChild(director);
    movieInfoContent.appendChild(actors);
    movieInfoContent.appendChild(language);
    movieInfoContent.appendChild(plot);
    movieInfoContent.appendChild(rating);

    movieWrapper.appendChild(movieContainer);
    movieContainer.appendChild(movieInfoContent);
    mainRef.appendChild(movieWrapper);
    console.log(movieInfo);

    closeBtn.addEventListener('click', () => {
        closeMovieInfo();
    });

    window.addEventListener("click", function(event){
        if (event.target === movieWrapper) {
          closeMovieInfo();
        };
      });
}

function closeMovieInfo() {
        isFetching = false;
        let movieInfo = document.querySelector('.movieInfoContent');
        let movieContainer = document.querySelector('.movieContainer');
        movieInfo.remove();
        movieContainer.remove();
}

 
//Get random movies from the function getRandomMovieTitle in random.js and display the movie name on the page
function randomMovieTitle() {
    let movie = random.getRandomMovie();
    console.log(movie);
    document.querySelector('#randomMovieSpan').innerHTML = movie;
}

function favoritePage() {
    console.log('Inside the favoritePage function!');
    window.scrollTo(0,0);
    document.querySelector('.asideNav').classList.add('menuClose');
    document.querySelector('.searchedMovies').classList.add('d-none');
    document.querySelector('.topMovies').classList.add('d-none');
    document.querySelector('.favoriteMovies').classList.remove('d-none'); 
}

async function addFavoriteMovie(event) {
    let movieId = event.target.parentElement.parentElement.getAttribute('data-id');
    event.target.classList.remove('fa-regular');
    event.target.classList.add('fa-solid');
    console.log(movieId);

    try {
        let movieInfo = await api.getApi('http://www.omdbapi.com/?i=' + movieId + '&apikey=ce81fd7d');
        console.log(movieInfo);
        favMovies.push(movieInfo);
        localStorage.setItem('favMovies', JSON.stringify(favMovies));
        renderFavoriteMovies(movieInfo);
    } catch (error) {
        console.log('Error while adding a favorite movie: ', error);
    }
}

function renderFavoriteMovies(movieInfo) {
    console.log('Inside the renderFavoriteMovies function!');
    console.log(movieInfo);
    let favoriteContainer = document.querySelector('.favoriteWrapper');
    const poster = document.createElement('article');
    const posterImg = document.createElement('img');
    const heart = document.createElement('i');
    const heartBtn = document.createElement('button');
    heartBtn.classList.add('heartBtn');
    heart.classList.add('fa-solid', 'fa-heart', 'heart');
    const title = document.createElement('h2');
    poster.classList.add('favoriteMoviePosterContainer');
    title.classList.add('movieTitle');
    posterImg.classList.add('favoriteMoviePoster');
    title.textContent = movieInfo.Title;
    posterImg.src = movieInfo.Poster;
    posterImg.alt = 'A poster of to the movie: ' + movieInfo.Title;
    poster.setAttribute('data-id', movieInfo.imdbID);
    heartBtn.appendChild(heart);
    poster.appendChild(heartBtn);
    poster.appendChild(posterImg);
    poster.appendChild(title);
    favoriteContainer.appendChild(poster);

    posterImg.addEventListener('click', () => {
        console.log('You clicked on a favorite movie!');
        console.log(movieInfo);
        renderMoreInfo(movieInfo);
    });

    heartBtn.addEventListener('click', event => {
        if(heart.classList.contains('fa-regular')) {
            
            addFavoriteMovie(event);
            console.log('Nu ska filmen adderas');
        } else {
            removeFavoriteMovies(event);
            console.log('Nu ska filmen raderas');
        }
    });
}

function removeFavoriteMovies(event) {
    console.log('Inside the removeFavoriteMovies function!');
    let movieId = event.target.parentElement.parentElement.getAttribute('data-id');
    console.log(movieId);

    let favoriteMovies = document.querySelectorAll('.favoriteMoviePosterContainer');
    favoriteMovies.forEach(movie => {
        if(movie.getAttribute('data-id') === movieId) {
            movie.remove();
            
            favMovies = favMovies.filter(movie => movie.imdbID !== movieId);

            let allMovies = document.querySelectorAll('.moviePosterContainer');
            allMovies.forEach(movie => {
                if(movie.getAttribute('data-id') === movieId) {
                    let heart = movie.querySelector('.heart');
                    heart.classList.remove('fa-solid');
                    heart.classList.add('fa-regular');
                }
            });
        }
    });
    localStorage.setItem('favMovies', JSON.stringify(favMovies));
} 

document.querySelector('#menu').addEventListener('click', () => { 
    if(document.querySelector('.asideNav').classList.contains('menuClose')) {
        document.querySelector('#menu').innerHTML = '<i class="fa-solid fa-x"></i>';
        console.log('Menyn är öppen');
    } else if(!document.querySelector('.asideNav').classList.contains('menuClose')) {
        document.querySelector('#menu').innerHTML = '<i class="fa-solid fa-bars"></i>';
        console.log('Menyn är stängd');
    }
    openMenu();
});

function openMenu() {
    let menu = document.querySelector('.asideNav');
    menu.classList.toggle('menuClose');
}