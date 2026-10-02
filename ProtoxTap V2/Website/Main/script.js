const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const siteMenu = document.querySelector('.site-menu');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Keep the mobile menu small and predictable: it closes after navigation and on Escape.
menuToggle?.addEventListener('click', () => {
    const isOpen = siteMenu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
});

siteMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
        siteMenu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
    });
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        siteMenu?.classList.remove('open');
        menuToggle?.setAttribute('aria-expanded', 'false');
    }
});

const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 20);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const demo = document.querySelector('[data-demo]');
const statusMessage = demo?.querySelector('.status-message');
const statusStep = demo?.querySelector('.status-step');
let demoTimer;

const runDemo = () => {
    if (!demo) return;
    window.clearTimeout(demoTimer);
    demo.classList.remove('is-running');
    if (prefersReducedMotion) {
        demo.classList.add('is-running');
        if (statusMessage) statusMessage.textContent = 'Review page ready';
        if (statusStep) statusStep.textContent = '03 / 03';
        return;
    }
    if (statusMessage) statusMessage.textContent = 'Bring your phone closer';
    if (statusStep) statusStep.textContent = '01 / 03';
    requestAnimationFrame(() => demo.classList.add('is-running'));
    demoTimer = window.setTimeout(() => {
        if (statusMessage) statusMessage.textContent = 'Review page ready';
        if (statusStep) statusStep.textContent = '03 / 03';
    }, 4000);
};

const demoObserver = new IntersectionObserver((entries, observer) => {
    if (entries.some((entry) => entry.isIntersecting)) {
        runDemo();
        observer.disconnect();
    }
}, { threshold: 0.35 });
if (demo) demoObserver.observe(demo);
document.querySelector('.demo-replay')?.addEventListener('click', runDemo);

// The product tilt is intentionally limited so it remains a subtle physical response, not a distraction.
if (!prefersReducedMotion && window.matchMedia('(min-width: 801px)').matches) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
        card.addEventListener('pointermove', (event) => {
            const bounds = card.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;
            const baseRotation = card.classList.contains('product-large') ? -13 : 0;
            card.style.transform = `perspective(800px) rotateX(${y * -5}deg) rotateY(${x * 7}deg) rotateZ(${baseRotation + x * 3}deg)`;
        });
        card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
}