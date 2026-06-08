/* ============================================
   The Stray Dog Blog - rendering & interactions
   ============================================ */

/* Mobile nav toggle */
function initNav() {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function() {
      links.classList.toggle("open");
    });
    /* Close menu when clicking a link */
    var navItems = links.querySelectorAll("a");
    for (var i = 0; i < navItems.length; i++) {
      navItems[i].addEventListener("click", function() {
        links.classList.remove("open");
      });
    }
  }
}

/* Header scroll effect */
function initScrollHeader() {
  var header = document.querySelector(".site-header");
  if (!header) return;
  window.addEventListener("scroll", function() {
    if (window.scrollY > 10) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

/* Date formatting helper */
function formatDate(iso) {
  var d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

/* Find post by slug */
function getPostBySlug(posts, slug) {
  for (var i = 0; i < posts.length; i++) {
    if (posts[i].slug === slug) return posts[i];
  }
  return null;
}

/* Build a post card */
function postCard(post) {
  return '<article class="card">' +
    '<a href="post.html?slug=' + encodeURIComponent(post.slug) + '" aria-label="' + post.title + '">' +
      '<div class="card-media">' +
        '<img src="' + post.cover + '" alt="' + post.title + '" loading="lazy">' +
      '</div>' +
      '<div class="card-body">' +
        '<span class="tag">' + post.tag + '</span>' +
        '<h3 class="card-title">' + post.title + '</h3>' +
        '<p class="card-excerpt">' + post.excerpt + '</p>' +
        '<div class="card-meta">' + formatDate(post.date) + ' &middot; ' + post.author + '</div>' +
      '</div>' +
    '</a>' +
  '</article>';
}

/* Featured post (home) */
function renderFeatured(el, posts) {
  var post = null;
  for (var i = 0; i < posts.length; i++) {
    if (posts[i].featured) { post = posts[i]; break; }
  }
  if (!post) post = posts[0];

  el.innerHTML = '<article class="featured">' +
    '<a class="card-media" href="post.html?slug=' + encodeURIComponent(post.slug) + '">' +
      '<img src="' + post.cover + '" alt="' + post.title + '">' +
    '</a>' +
    '<div class="card-body">' +
      '<span class="tag">' + post.tag + '</span>' +
      '<h2 class="card-title">' + post.title + '</h2>' +
      '<p class="card-excerpt">' + post.excerpt + '</p>' +
      '<div class="card-meta">' + formatDate(post.date) + ' &middot; ' + post.author + '</div>' +
      '<a class="btn" style="margin-top:16px;align-self:flex-start" href="post.html?slug=' + encodeURIComponent(post.slug) + '">Read the story</a>' +
    '</div>' +
  '</article>';
}

/* Recent posts grid (home) */
function renderRecent(el, posts, limit) {
  var featuredSlug = "";
  for (var i = 0; i < posts.length; i++) {
    if (posts[i].featured) { featuredSlug = posts[i].slug; break; }
  }
  var recent = [];
  for (var j = 0; j < posts.length; j++) {
    if (posts[j].slug !== featuredSlug) {
      recent.push(posts[j]);
    }
    if (recent.length >= (limit || 3)) break;
  }
  var html = "";
  for (var k = 0; k < recent.length; k++) {
    html += postCard(recent[k]);
  }
  el.innerHTML = html;
}

/* Full feed (blog page) */
function renderFeed(el, posts) {
  var html = "";
  for (var i = 0; i < posts.length; i++) {
    html += postCard(posts[i]);
  }
  el.innerHTML = html;
}

/* Single post page */
function renderArticle(posts) {
  var params = new URLSearchParams(location.search);
  var slug = params.get("slug");
  var post = getPostBySlug(posts, slug);
  var mount = document.getElementById("article");
  if (!mount) return;

  if (!post) {
    mount.innerHTML = '<div class="article-wrap">' +
      '<div class="article-card">' +
        '<p class="empty">Sorry, we could not find that story.</p>' +
        '<p style="text-align:center"><a class="btn" href="blog.html">Back to the blog</a></p>' +
      '</div>' +
    '</div>';
    document.title = "Story not found - The Stray Dog Blog";
    return;
  }

  document.title = post.title + " - The Stray Dog Blog";
  var hero = document.getElementById("article-hero");
  if (hero) {
    hero.style.backgroundImage = "url('" + post.cover + "')";
  }

  mount.innerHTML = '<div class="article-wrap">' +
    '<div class="article-card">' +
      '<a class="back-link" href="blog.html">&larr; All stories</a>' +
      '<span class="tag">' + post.tag + '</span>' +
      '<h1>' + post.title + '</h1>' +
      '<div class="article-meta">' + formatDate(post.date) + ' &middot; By ' + post.author + '</div>' +
      '<div class="article-body">' + post.body + '</div>' +
    '</div>' +
  '</div>';
}

/* Newsletter form (demo only) */
function initNewsletter() {
  var form = document.getElementById("subscribe-form");
  if (!form) return;
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    var note = document.getElementById("form-note");
    var input = form.querySelector('input[type="email"]');
    if (input && input.value) {
      if (note) {
        note.textContent = "Thank you! You're on the list. \uD83D\uDC3E";
        note.style.color = "#fff";
      }
      form.reset();
    }
  });
}

/* Footer year */
function initYear() {
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
}

/* Load posts from JSON and render the page */
function loadPosts() {
  fetch("data/posts.json")
    .then(function(response) { return response.json(); })
    .then(function(data) {
      var posts = data.items;

      var featuredEl = document.getElementById("featured");
      if (featuredEl) renderFeatured(featuredEl, posts);

      var recentEl = document.getElementById("recent-posts");
      if (recentEl) renderRecent(recentEl, posts, 3);

      var feedEl = document.getElementById("feed");
      if (feedEl) renderFeed(feedEl, posts);

      renderArticle(posts);
    })
    .catch(function(err) {
      console.error("Failed to load posts:", err);
    });
}

/* Boot */
document.addEventListener("DOMContentLoaded", function() {
  initNav();
  initScrollHeader();
  initNewsletter();
  initYear();
  loadPosts();
});
