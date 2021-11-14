const base_URL = ' https://movie-list.alphacamp.io'
const index_URL = base_URL + '/api/v1/movies/'
const poster_URL = base_URL + '/posters/'

const movies = []
let filterMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const viewModel = document.querySelector('#view-model')
const gridButton = document.getElementById('grid-view-mode')
const listButton = document.getElementById('list-view-mode')

const MOVIES_PER_PAGE = 12
let listPage = 1

//==================以下function=========
// renderMovieList by card Function
function renderMovieListOnGrid(data) {
  let rawHTML = ''
  data.forEach( item =>{
    rawHTML += `
    <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img
                src=${poster_URL + item.image}
                class="card-img-top" alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer text-muted">
                <button type="button" class="btn btn-primary btn-show-movie" data-toggle="modal"
                  data-target="#movie-modal" data-id="${item.id}">
                  More
                </button>
                <button type="button" class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

// renderMovieList by list Function
function renderMovieListOnList (data){
  let rawHTML = ''
  data.forEach( item => {
    rawHTML += `
      <div class="container card">
        <div class="card-body d-flex justify-content-between align-items-center">
          <h5 class="card-title d-inline">${item.title}</h5>
          <div class="d-inline">
            <button type="button" class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal"data-id="${item.id}">
              More
            </button>
            <button type="button" class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

// getMoviesByPage Function
function getMoviesByPage(page) {
  // page 1 -> 0-11
  // page 2 -> 12-23
  // movies || filtermovies
  const data = filterMovies.length ? filterMovies : movies
  const startIndex = MOVIES_PER_PAGE * (page - 1)
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}
// renderPagination Function
function renderPaginator(amount) {
  const numderOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numderOfPages; page++){
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
    paginator.innerHTML = rawHTML
  }
}
//showMovieModal Function
function showMovieModal(id) {
  const modalMovieTitle = document.getElementById('movie-modal-title')
  const modalMovieImage = document.getElementById('movie-modal-image')
  const modalMovieDate = document.getElementById('movie-modal-date')
  const modalMovieDesciption = document.getElementById('movie-modal-description')
  axios.get(index_URL + id)
    .then( response => {
      const data = response.data.results
      modalMovieTitle.innerText = data.title
      modalMovieDate.innerText = 'Release date:' + data.release_date
      modalMovieDesciption.innerText = data.description 
      modalMovieImage.innerHTML = `
        <img src=${poster_URL + data.image} alt="movie-poster" class="img-fluid">
      ` 
    })

}
// addToFavorite Function
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// =========================以下執行========
// render movie list
axios.get(index_URL) //如果URL有變，修改宣告變數的值就好了
  .then(response => {

    // for (const movie of response.data.results){
    //   movies.push(movie)
    // }
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieListOnGrid(getMoviesByPage(listPage))

  })
  .catch((err) => console.log(err))

// paginator addEventListener(分頁)
paginator.addEventListener('click', function onPaginatorClicked(event){
  if (event.target.tagName !== 'A') return
  listPage = Number(event.target.dataset.page)

  if (listButton.className.includes('selected')){
    renderMovieListOnList(getMoviesByPage(listPage))
  } else if (gridButton.className.includes('selected')) {
    renderMovieListOnGrid(getMoviesByPage(listPage))
  }
})

// 按下按鈕可以看modal也可以修改favorite list
dataPanel.addEventListener('click', function onPanelClicked(event){
  if (event.target.matches('.btn-show-movie')){
    const movieId = Number(event.target.dataset.id)
    showMovieModal(movieId)
  } else if (event.target.matches('.btn-add-favorite')) {
    const movieId = Number(event.target.dataset.id)
    addToFavorite(movieId)
  }
})

// search功能
searchForm.addEventListener('submit', function onSearchFormSubmitted(event){
  event.preventDefault() //清除瀏覽器的預設值
  const keyword = searchInput.value.trim().toLowerCase()
  
  //條件篩選
  for (const movie of movies) {
    if (movie.title.toLowerCase().includes(keyword)) {
      filterMovies.push(movie)
    }
  }
  //錯誤處理
  if (filterMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  // render again
  renderPaginator(filterMovies.length)
  if (listButton.className.includes('selected')) {
    renderMovieListOnList(getMoviesByPage(listPage))
  } else if (gridButton.className.includes('selected')) {
    renderMovieListOnGrid(getMoviesByPage(listPage))
  }

})

//render type
viewModel.addEventListener('click', function onRenderTypeClicked(event){
  if (event.target.matches('#list-view-mode')){
    gridButton.classList.remove('selected')
    listButton.classList.add('selected')
    renderMovieListOnList(getMoviesByPage(listPage))
  } else if (event.target.matches('#grid-view-mode')){
    listButton.classList.remove('selected')
    gridButton.classList.add('selected')
    renderMovieListOnGrid(getMoviesByPage(listPage))
  }
})