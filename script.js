var likes = {};
var postCount = 4;
var activeFilter = "all";
var toastTimer = null;
function $(id) {
return document.getElementById(id);
}
function showToast(msg) {
var t = $("toast");
if (!t) {
alert(msg);
return;
}
t.textContent = msg;
t.classList.add("show");
if (toastTimer) clearTimeout(toastTimer);
toastTimer = setTimeout(function () {
t.classList.remove("show");
}, 2400);
}
function safeText(s) {
return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function currentPosts() {
return Array.prototype.slice.call(document.getElementsByClassName("post"));
}
function updateCount(visible, total) {
var el = $("resultCount");
if (el) el.textContent = visible + " of " + total + " posts";
var empty = $("emptyState");
if (empty) empty.style.display = visible === 0 ? "" : "none";
}
function applyFilters() {
var q = "";
var box = $("searchBox");
if (box) q = box.value.toLowerCase().trim();
var posts = currentPosts();
var visible = 0;
for (var i = 0; i < posts.length; i++) {
var title = posts[i].querySelector("h3").innerText.toLowerCase();
var cat = posts[i].getAttribute("data-category");
var okSearch = q === "" || title.includes(q);
var okCat = activeFilter === "all" || cat === activeFilter;
if (okSearch && okCat) {
posts[i].style.display = "";
visible++;
} else {
posts[i].style.display = "none";
}
}
updateCount(visible, posts.length);
}
function searchPosts() {
applyFilters();
}
function filterPosts(cat) {
activeFilter = cat;
var chips = document.querySelectorAll(".chip");
for (var i = 0; i < chips.length; i++) {
if (chips[i].getAttribute("data-filter") === cat) chips[i].classList.add("active");
else chips[i].classList.remove("active");
}
applyFilters();
}
function resetFilters() {
activeFilter = "all";
var box = $("searchBox");
if (box) box.value = "";
var chips = document.querySelectorAll(".chip");
for (var j = 0; j < chips.length; j++) {
if (chips[j].getAttribute("data-filter") === "all") chips[j].classList.add("active");
else chips[j].classList.remove("active");
}
applyFilters();
}
function readMore(n) {
var more = $("more" + n);
if (!more) return;
var btn = $("rbtn" + n);
var open = more.style.display === "none" || more.style.display === "";
if (open) {
more.style.display = "block";
if (btn) btn.textContent = "Show Less −";
} else {
more.style.display = "none";
if (btn) btn.textContent = "Read More +";
}
}
function loadLikes() {
try {
var raw = localStorage.getItem("rajveer_likes");
if (raw) likes = JSON.parse(raw) || {};
} catch (e) {
likes = {};
}
for (var k in likes) {
var el = $("like" + k);
if (el) {
el.textContent = likes[k];
var b = el.closest(".like-btn");
if (b && likes[k] > 0) b.classList.add("liked");
}
}
}
function saveLikes() {
try {
localStorage.setItem("rajveer_likes", JSON.stringify(likes));
} catch (e) {}
}
function likePost(n) {
if (!likes[n]) likes[n] = 0;
likes[n]++;
var el = $("like" + n);
if (el) {
el.textContent = likes[n];
var b = el.closest(".like-btn");
if (b) {
b.classList.add("liked");
b.style.transform = "scale(1.15)";
setTimeout(function () { b.style.transform = ""; }, 160);
}
}
saveLikes();
}
function addComment(n) {
var nameEl = $("cname" + n);
var textEl = $("ctext" + n);
if (!nameEl || !textEl) return;
var name = nameEl.value.trim();
var text = textEl.value.trim();
if (name === "" || text === "") {
showToast("Please write your name and comment");
return;
}
var list = $("clist" + n);
var p = document.createElement("div");
p.className = "comment";
var b = document.createElement("b");
b.textContent = name;
var span = document.createElement("span");
span.textContent = " " + text;
var small = document.createElement("small");
small.textContent = new Date().toLocaleString();
p.appendChild(b);
p.appendChild(span);
p.appendChild(small);
list.prepend(p);
nameEl.value = "";
textEl.value = "";
saveLocalComments(n);
showToast("Comment posted");
}
function saveLocalComments(n) {
try {
var list = $("clist" + n);
if (!list) return;
var items = [];
var nodes = list.querySelectorAll(".comment");
for (var i = 0; i < Math.min(nodes.length, 20); i++) {
items.push(nodes[i].innerHTML);
}
localStorage.setItem("rajveer_comments_" + n, JSON.stringify(items));
} catch (e) {}
}
function loadLocalComments() {
for (var n = 1; n <= 30; n++) {
try {
var raw = localStorage.getItem("rajveer_comments_" + n);
if (!raw) continue;
var items = JSON.parse(raw);
var list = $("clist" + n);
if (!list) continue;
for (var i = items.length - 1; i >= 0; i--) {
var d = document.createElement("div");
d.className = "comment";
d.innerHTML = items[i];
list.appendChild(d);
}
} catch (e) {}
}
}
function badgeLabel(cat) {
if (cat === "tech") return "Tech";
if (cat === "travel") return "Travel";
return "Food";
}
function addPost() {
var titleEl = $("ptitle");
var catEl = $("pcat");
var contentEl = $("pcontent");
var imgEl = $("pimage");
var title = titleEl.value.trim();
var cat = catEl.value;
var content = contentEl.value.trim();
var imgUrl = imgEl ? imgEl.value.trim() : "";
if (title === "" || content === "") {
showToast("Please fill title and content");
return;
}
postCount++;
var n = postCount;
likes[n] = 0;
var wrap = $("newPosts");
var art = document.createElement("article");
art.className = "post";
art.setAttribute("data-category", cat);
var media = document.createElement("div");
media.className = "post-media";
var img = document.createElement("img");
img.alt = title;
img.loading = "lazy";
if (imgUrl !== "") img.src = imgUrl;
else img.src = "https://picsum.photos/seed/newpost" + n + "/600/340";
img.onerror = function () { img.src = "https://picsum.photos/seed/fallback" + n + "/600/340"; };
var badge = document.createElement("span");
badge.className = "badge " + cat;
badge.textContent = badgeLabel(cat);
media.appendChild(img);
media.appendChild(badge);
var body = document.createElement("div");
body.className = "post-body";
var h = document.createElement("h3");
h.textContent = title;
var date = document.createElement("p");
date.className = "date";
date.textContent = "Just now • New";
var excerpt = document.createElement("p");
excerpt.className = "excerpt";
excerpt.textContent = content.length > 140 ? content.slice(0, 140) + "…" : content;
var more = document.createElement("p");
more.id = "more" + n;
more.className = "more";
more.style.display = "none";
more.textContent = content;
var actions = document.createElement("div");
actions.className = "post-actions";
var rbtn = document.createElement("button");
rbtn.className = "btn btn-ghost btn-sm";
rbtn.id = "rbtn" + n;
rbtn.textContent = "Read More +";
rbtn.setAttribute("onclick", "readMore(" + n + ")");
var likeBtn = document.createElement("button");
likeBtn.className = "like-btn";
likeBtn.setAttribute("onclick", "likePost(" + n + ")");
likeBtn.innerHTML = "♥ <span id=\"like" + n + "\">0</span>";
actions.appendChild(rbtn);
actions.appendChild(likeBtn);
var comments = document.createElement("div");
comments.className = "comments";
var form = document.createElement("div");
form.className = "comment-form";
var in1 = document.createElement("input");
in1.type = "text";
in1.id = "cname" + n;
in1.placeholder = "Your name";
in1.maxLength = 30;
var in2 = document.createElement("input");
in2.type = "text";
in2.id = "ctext" + n;
in2.placeholder = "Write a comment...";
in2.maxLength = 200;
var cbtn = document.createElement("button");
cbtn.className = "btn btn-primary btn-sm";
cbtn.textContent = "Post";
cbtn.setAttribute("onclick", "addComment(" + n + ")");
var clist = document.createElement("div");
clist.id = "clist" + n;
clist.className = "comment-list";
form.appendChild(in1);
form.appendChild(in2);
form.appendChild(cbtn);
comments.appendChild(form);
comments.appendChild(clist);
body.appendChild(h);
body.appendChild(date);
body.appendChild(excerpt);
body.appendChild(more);
body.appendChild(actions);
body.appendChild(comments);
art.appendChild(media);
art.appendChild(body);
wrap.prepend(art);
saveCustomPost(title, cat, content, imgUrl);
titleEl.value = "";
contentEl.value = "";
if (imgEl) imgEl.value = "";
updateChar();
applyFilters();
showToast("Your post is published");
document.getElementById("posts").scrollIntoView({ behavior: "smooth" });
}
function saveCustomPost(title, cat, content, imgUrl) {
try {
var raw = localStorage.getItem("rajveer_posts");
var arr = raw ? JSON.parse(raw) : [];
arr.unshift({ title: title, cat: cat, content: content, img: imgUrl });
localStorage.setItem("rajveer_posts", JSON.stringify(arr.slice(0, 20)));
} catch (e) {}
}
function loadCustomPosts() {
try {
var raw = localStorage.getItem("rajveer_posts");
if (!raw) return;
var arr = JSON.parse(raw);
for (var i = arr.length - 1; i >= 0; i--) {
(function (item) {
postCount++;
var n = postCount;
likes[n] = 0;
var wrap = $("newPosts");
var art = document.createElement("article");
art.className = "post";
art.setAttribute("data-category", item.cat);
var media = document.createElement("div");
media.className = "post-media";
var img = document.createElement("img");
img.alt = item.title;
img.loading = "lazy";
img.src = item.img && item.img !== "" ? item.img : "https://picsum.photos/seed/saved" + n + "/600/340";
var badge = document.createElement("span");
badge.className = "badge " + item.cat;
badge.textContent = badgeLabel(item.cat);
media.appendChild(img);
media.appendChild(badge);
var body = document.createElement("div");
body.className = "post-body";
var h = document.createElement("h3");
h.textContent = item.title;
var date = document.createElement("p");
date.className = "date";
date.textContent = "Saved post";
var ex = document.createElement("p");
ex.className = "excerpt";
ex.textContent = item.content.length > 140 ? item.content.slice(0, 140) + "…" : item.content;
var more = document.createElement("p");
more.id = "more" + n;
more.className = "more";
more.style.display = "none";
more.textContent = item.content;
var actions = document.createElement("div");
actions.className = "post-actions";
var rb = document.createElement("button");
rb.className = "btn btn-ghost btn-sm";
rb.id = "rbtn" + n;
rb.textContent = "Read More +";
rb.setAttribute("onclick", "readMore(" + n + ")");
var lb = document.createElement("button");
lb.className = "like-btn";
lb.setAttribute("onclick", "likePost(" + n + ")");
lb.innerHTML = "♥ <span id=\"like" + n + "\">0</span>";
actions.appendChild(rb);
actions.appendChild(lb);
var cwrap = document.createElement("div");
cwrap.className = "comments";
var form = document.createElement("div");
form.className = "comment-form";
var a1 = document.createElement("input");
a1.id = "cname" + n;
a1.placeholder = "Your name";
var a2 = document.createElement("input");
a2.id = "ctext" + n;
a2.placeholder = "Write a comment...";
var ab = document.createElement("button");
ab.className = "btn btn-primary btn-sm";
ab.textContent = "Post";
ab.setAttribute("onclick", "addComment(" + n + ")");
var cl = document.createElement("div");
cl.id = "clist" + n;
cl.className = "comment-list";
form.appendChild(a1);
form.appendChild(a2);
form.appendChild(ab);
cwrap.appendChild(form);
cwrap.appendChild(cl);
body.appendChild(h);
body.appendChild(date);
body.appendChild(ex);
body.appendChild(more);
body.appendChild(actions);
body.appendChild(cwrap);
art.appendChild(media);
art.appendChild(body);
wrap.prepend(art);
})(arr[i]);
}
} catch (e) {}
}
function darkMode() {
var isDark = document.body.classList.toggle("dark");
try {
localStorage.setItem("rajveer_theme", isDark ? "dark" : "light");
} catch (e) {}
var btn = $("themeBtn");
if (btn) btn.textContent = isDark ? "☀" : "◐";
}
function loadTheme() {
try {
var t = localStorage.getItem("rajveer_theme");
if (t === "dark") {
document.body.classList.add("dark");
var btn = $("themeBtn");
if (btn) btn.textContent = "☀";
}
} catch (e) {}
}
function toggleMenu() {
var m = $("menu");
m.classList.toggle("open");
if (m.style.display === "block") {
m.style.display = "";
m.classList.remove("open");
} else if (window.innerWidth <= 640 && !m.classList.contains("open")) {
m.style.display = "";
} else if (window.innerWidth <= 640) {
m.style.display = "";
}
}
function subscribe() {
var e = $("email").value.trim();
if (e.includes("@") && e.includes(".") && e.length > 5 && e.indexOf("@") > 0 && e.lastIndexOf(".") > e.indexOf("@")) {
showToast("Thanks for subscribing");
$("email").value = "";
try {
localStorage.setItem("rajveer_sub", "yes");
} catch (err) {}
} else {
showToast("Please enter a correct email");
}
}
function scrollToTop() {
window.scrollTo({ top: 0, behavior: "smooth" });
}
function updateChar() {
var c = $("pcontent");
var label = $("charCount");
if (c && label) label.textContent = c.value.length + " characters";
}
document.addEventListener("DOMContentLoaded", function () {
loadTheme();
loadLikes();
loadCustomPosts();
loadLocalComments();
applyFilters();
updateChar();
var pc = $("pcontent");
if (pc) pc.addEventListener("input", updateChar);
var email = $("email");
if (email) email.addEventListener("keydown", function (ev) {
if (ev.key === "Enter") subscribe();
});
var links = document.querySelectorAll("#menu a");
for (var i = 0; i < links.length; i++) {
links[i].addEventListener("click", function () {
var m = $("menu");
if (window.innerWidth <= 640) {
m.classList.remove("open");
m.style.display = "";
}
});
}
window.addEventListener("scroll", function () {
var h = document.documentElement;
var p = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
var bar = $("progress");
if (bar) bar.style.width = p + "%";
var top = $("toTop");
if (top) {
if (h.scrollTop > 600) top.classList.add("show");
else top.classList.remove("show");
}
}, { passive: true });
});