function initBackToTop() {
const button = document.querySelector('.back-to-top');
if (!button) return;
const threshold = 300;
const update = () => button.classList.toggle('visible', window.scrollY > threshold);
window.addEventListener('scroll', update, { passive: true });
button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
update();
}
initBackToTop();