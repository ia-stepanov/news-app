// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }

          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }

          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}

// Init http module
const http = customHttp();

// Cервис для работы с новостями
const newsService = (function () {
  const apiKey = 'fe31fcc2dee64f79acb127e312b48d7a';
  const apiUrl = 'https://news-api-v2.herokuapp.com';

  return {
    topHeadlines(country = 'ru', category = 'science', cb) {
      http.get(
        `${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,
        cb
      );
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    },
  };
})();

// Elements
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const categorySelect = form.elements['category'];
const searchInput = form.elements['search'];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  loadNews();
});

//  init selects
document.addEventListener('DOMContentLoaded', function () {
  M.AutoInit();
  loadNews();
});

// Базовая загрузка новостей
function loadNews() {
  showLoader();

  const country = countrySelect.value;
  const category = categorySelect.value;
  const searchText = searchInput.value;

  if (!searchText) {
    newsService.topHeadlines(country, category, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }
}

// Получить ответ от сервера
function onGetResponse(err, res) {
  removeLoader();

  if (err) {
    showAlert(err, 'error-msg');
    return;
  }

  if (!res.articles.length) {
    showAlert(err, 'error-msg');
    return;
  }

  renderNews(res.articles);
}

// Отрисовать новости на странице
function renderNews(news) {
  const newsContainer = document.querySelector('.news-container .row');
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }

  let fragment = '';

  news.forEach((newsItem) => {
    const el = newsTemplate(newsItem);
    fragment += el;
  });

  newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

// Очистить контейнер с новостями
function clearContainer(container) {
  // container.innerHTML = '';

  let child = container.lastElementChild;
  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

// HTML–шаблон для новостей
function newsTemplate({ urlToImage, title, url, author }) {
  return `
    <div class="col s12">
      <a href="${url}">
        <div class="card">
          <div class="card-image scale">
  <img src="${
    urlToImage || 'https://via.placeholder.com/800x165?text=Изображение отсутствует'
  }" alt="${author}">
          </div>
          <div class="card-content">
  <span class="card-title">${
    !title
      ? 'Заголовок отсутствует'
      : title.length > 116
      ? title.slice(0, 116) + '…'
      : title
  }</span>
          </div>
        </div>
      </a>
    </div>
  `;
}

// Показать предупреждение
function showAlert(msg, type = 'success') {
  M.toast({ html: msg, classes: type });
  addAlertEmptyNews();
}

function addAlertEmptyNews() {
  const alertNews = document.querySelector('.alert');
  alertNews.innerHTML = '';

  const alert = document.createElement('span');
  alert.style.cssText = `
  display: flex;
  justify-content: center;
  color: #808080;
  font-size: 1.25rem;
  `;
  alert.dataset.alert = '';
  alert.textContent = 'Не удалось загрузить новости';
  alertNews.insertAdjacentElement('afterbegin', alert);
}

// Показать лоадер
function showLoader() {
  document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <div class="progress">
        <div class="indeterminate"></div>
    </div>
    `
  );
}

// Удалить лоадер
function removeLoader() {
  const loader = document.querySelector('.progress');

  if (loader) {
    loader.remove();
  }
}
