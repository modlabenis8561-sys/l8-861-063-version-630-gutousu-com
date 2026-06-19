(function () {
  var params = new URLSearchParams(window.location.search);
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');
  var initial = params.get('q') || '';

  function card(movie) {
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + movie.url + '">',
      '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">',
      '<span class="quality-badge">高清</span>',
      '</a>',
      '<div class="card-body">',
      '<h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
      '<p>' + escapeHtml(movie.line) + '</p>',
      '<div class="movie-meta">',
      '<span>' + escapeHtml(movie.year) + '</span>',
      '<span>' + escapeHtml(movie.region) + '</span>',
      '<span>' + escapeHtml(movie.type) + '</span>',
      '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (match) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[match];
    });
  }

  function search(query) {
    var q = query.trim().toLowerCase();
    if (!q) {
      status.textContent = '输入关键词开始搜索';
      results.innerHTML = '';
      return;
    }

    var matched = MOVIE_SEARCH_INDEX.filter(function (movie) {
      var text = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags, movie.line].join(' ').toLowerCase();
      return text.indexOf(q) !== -1;
    }).slice(0, 120);

    status.textContent = matched.length ? '搜索结果：' + query : '未找到相关内容';
    results.innerHTML = matched.map(card).join('');
  }

  if (input) {
    input.value = initial;
    input.addEventListener('input', function () {
      search(input.value);
    });
    search(initial);
  }
})();
