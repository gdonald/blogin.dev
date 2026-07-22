const BLOGIN_SEARCH_CAP = 10;
(function () {
const WEIGHT = { title: 10, tag: 5, body: 1 };
const CAP = (typeof BLOGIN_SEARCH_CAP === 'number') ? BLOGIN_SEARCH_CAP : 10;
const form = document.querySelector('[data-blogin-search]');
if (!form) return;
const input = form.querySelector('input');
const results = document.querySelector('[data-blogin-results]');
let records = [];
fetch('/search-index.json').then(function (r) { return r.json(); }).then(function (data) {
records = data;
});
function tokenize(text) {
return (text.toLowerCase().match(/\w+/g) || []);
}
function wordCount(text, token) {
return tokenize(text).filter(function (w) { return w.indexOf(token) === 0; }).length;
}
function rank(query) {
const tokens = tokenize(query);
if (!tokens.length) return [];
const scored = [];
for (const rec of records) {
let score = 0;
for (const t of tokens) {
score += WEIGHT.title * wordCount(rec.title || '', t);
score += WEIGHT.tag * (rec.tags || []).map(function (x) { return x.toLowerCase(); })
.filter(function (x) { return x.indexOf(t) === 0; }).length;
score += WEIGHT.body * wordCount(rec.text || '', t);
}
if (score > 0) scored.push({ rec: rec, score: score });
}
scored.sort(function (a, b) {
return (b.score - a.score) || a.rec.title.localeCompare(b.rec.title);
});
return scored.slice(0, CAP).map(function (s) { return s.rec; });
}
function snippet(text, tokens) {
const lower = text.toLowerCase();
for (const t of tokens) {
const i = lower.indexOf(t);
if (i >= 0) {
const start = Math.max(0, i - 30);
return (start > 0 ? '…' : '') + text.slice(start, i + 60) + '…';
}
}
return text.slice(0, 90);
}
function render(query) {
results.innerHTML = '';
const tokens = tokenize(query);
for (const rec of rank(query)) {
const li = document.createElement('li');
const a = document.createElement('a');
a.href = rec.url;
const title = document.createElement('span');
title.className = 'blogin-result-title';
title.textContent = rec.title;
a.appendChild(title);
const p = document.createElement('p');
p.textContent = snippet(rec.text || '', tokens);
a.appendChild(p);
li.appendChild(a);
results.appendChild(li);
}
}
input.addEventListener('input', function () { render(input.value); });
})();