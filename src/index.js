import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";


const form = document.querySelector('.search-form');
const gallery = document.querySelector(".gallery");
const loadBtn = document.querySelector('.load-more');
const header = document.querySelector('.form-wrap');
const serviceDiv = document.querySelector('.service');
const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '38386853-763a1f2de355a94d7870ea155';
let params = {
    key: API_KEY,
    q: '',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: 1,
    per_page: 40,
}
let totalPages = 0;

axios.defaults.baseURL = BASE_URL;
loadBtn.hidden = true;


const submitter = function(evt){
    evt.preventDefault();
    loadBtn.hidden = true;
    serviceDiv.hidden = false;
    gallery.innerHTML = '';
    params.page = 1;
    const searchInput = evt.target.elements[0].value;
    params.q = searchInput;
    if(searchInput === '' || /^\W+/.test(searchInput)){
        header.classList.add('invalid');
        setTimeout(() => {
            header.classList.remove('invalid');
        }, 500)
        Notify.warning('Please enter some query to start searching!')
        return;
    }
    Loading.hourglass('Loading...', {backgroundColor: 'rgba(0,0,0,0.4)',});
    fetchImg()
    .then(data => {
        if(data.totalHits === 0){
            header.classList.add('invalid');
            setTimeout(() => {
                header.classList.remove('invalid');
            }, 500)    
            Notify.failure('"Sorry, there are no images matching your search query. Please try again.')
            return;
        }
        else if(data.totalHits > params.per_page){
            loadBtn.hidden = false;
        }
        serviceDiv.hidden = true;
        totalPages = Math.ceil(data.totalHits / params.per_page);
        if(totalPages === 1){
            loadBtn.hidden = true;
            Notify.info("We're sorry, but you've reached the end of search results.");
        }
        Notify.success(`Hooray! We found ${data.totalHits} images.`);
        makeMarkup(data);
    })
    .catch(err => Notify.failure(`Oops, something went wrong :( Try reload the page! ${err.message}`))
    .finally(Loading.remove(1000))
}
form.addEventListener('submit', submitter);

const onclick = function() {
    params.page +=1;
    if(params.page >= totalPages){
        loadBtn.hidden = true;
        Notify.info("We're sorry, but you've reached the end of search results.");
    }
    Loading.hourglass('Loading...', {backgroundColor: 'rgba(0,0,0,0.4)',});
    fetchImg()
    .then(data => {
        makeMarkup(data)
        const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();
        window.scrollBy({
        top: cardHeight,
        behavior: "smooth",});
    })
    .catch(err => Notify.failure(`Oops, something went wrong :( Try reload the page! ${err.message}`))
    .finally(Loading.remove(1000))
}
loadBtn.addEventListener('click', onclick);

async function fetchImg(){
    const options = {
        method: 'get',
        params,
    }
    const resp = await axios.get(``, options);
    return resp.data
}

function makeMarkup(data){
    const markup = data.hits.map(({webformatURL, largeImageURL, tags, likes, views, comments, downloads}) =>`
    <div class="photo-card">
     <a href="${largeImageURL}">
      <img src="${webformatURL}" alt="${tags}" loading="lazy" />
     </a>
     <div class="info">
        <div class="info-category">
          <p class="info-item-text">
            <b>Likes</b>
          </p>
          <p class="info-item-text categ">${likes}</p>
        </div>
        <div class="info-category">
          <p class="info-item-text">
            <b>Views</b>
          </p>
          <p class="info-item-text categ">${views}</p>
        </div>
        <div class="info-category">
          <p class="info-item-text">
            <b>Comments</b>
          </p>
          <p class="info-item-text categ">${comments}</p>
        </div>
        <div class="info-category">
          <p class="info-item-text">
            <b>Downloads</b>
          </p>
          <p class="info-item-text categ">${downloads}</p>
        </div>
      </div>
    </div>`).join('');
    gallery.insertAdjacentHTML('beforeend', markup);
    const lightbox = new SimpleLightbox('.gallery a');
    lightbox.refresh()
}

