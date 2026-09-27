'use strict';

(() => {
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const motionButton = document.querySelector('.motion-control');
  const motionLabel = document.querySelector('.motion-label');
  const hero = document.querySelector('.hero');
  const cards = [...document.querySelectorAll('.identity-card')];
  const activeAnimations = new Set();
  const decoders = new Set();
  const pointerResets = [];
  let preference = null;
  let enabled = false;

  try {
    const saved = localStorage.getItem('keij-motion');
    if (saved === 'playing' || saved === 'paused') preference = saved;
  } catch { /* Storage is optional, including when opening the HTML directly. */ }

  const canAnimate = () => enabled && !document.hidden;

  function animate(element, keyframes, options = {}) {
    if (!canAnimate() || !element?.animate || element.contains(document.activeElement)) return;
    const animation = element.animate(keyframes, {
      duration: 850, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both', ...options,
    });
    activeAnimations.add(animation);
    const release = () => {
      activeAnimations.delete(animation);
      element.removeEventListener('focusin', release);
      animation.cancel();
    };
    element.addEventListener('focusin', release, { once: true });
    animation.finished.then(release, () => {
      activeAnimations.delete(animation);
      element.removeEventListener('focusin', release);
    });
  }

  function settleMotion() {
    activeAnimations.forEach(animation => animation.cancel());
    activeAnimations.clear();
    decoders.forEach(decoder => decoder.stop());
    pointerResets.forEach(reset => reset());
  }

  function syncMotion() {
    // The OS is the default; an explicit page preference can override it.
    enabled = preference === null ? !reducedMotion.matches : preference === 'playing';
    root.classList.toggle('motion-enabled', enabled);
    root.classList.toggle('motion-paused', !enabled);
    motionButton.setAttribute('aria-pressed', String(enabled));
    motionButton.title = enabled ? 'Pause animations' : 'Enable animations';
    motionLabel.textContent = enabled ? 'MOTION ON' : 'MOTION OFF';
    document.dispatchEvent(new CustomEvent('keij:motionchange', { detail: { enabled } }));
    if (!enabled) {
      settleMotion();
      window.keijOpening?.finish();
    }
  }

  motionButton.addEventListener('click', () => {
    preference = enabled ? 'paused' : 'playing';
    syncMotion();
    try { localStorage.setItem('keij-motion', preference); } catch { /* Optional preference. */ }
  });
  reducedMotion.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', () => {
    root.classList.toggle('page-hidden', document.hidden);
    if (document.hidden) {
      settleMotion();
      window.keijOpening?.finish();
    }
  });
  root.classList.toggle('page-hidden', document.hidden);
  syncMotion();

  // Announce the stable name; scramble only its decorative visual copy.
  function makeDecoder(element) {
    if (!element) return null;
    const original = element.textContent;
    const visual = document.createElement('span');
    visual.className = 'decode-visual';
    visual.setAttribute('aria-hidden', 'true');
    visual.textContent = original;
    const accessible = document.createElement('span');
    accessible.className = 'sr-only';
    accessible.textContent = original;
    element.replaceChildren(visual, accessible);
    let frame = 0;
    let previous = -Infinity;
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      visual.textContent = original;
    };
    const play = (delay = 0) => {
      if (!canAnimate() || frame) return;
      const start = performance.now() + delay;
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const tick = now => {
        if (!canAnimate()) { stop(); return; }
        if (now < start) { frame = requestAnimationFrame(tick); return; }
        const progress = Math.min(1, (now - start) / 660);
        if (now - previous > 34) {
          visual.textContent = [...original].map((character, index) =>
            character === ' ' || index < progress * original.length
              ? character : characters[Math.floor(Math.random() * characters.length)]
          ).join('');
          previous = now;
        }
        if (progress < 1) frame = requestAnimationFrame(tick);
        else stop();
      };
      frame = requestAnimationFrame(tick);
    };
    element.addEventListener('pointerenter', () => play());
    const decoder = { play, stop };
    decoders.add(decoder);
    return decoder;
  }
  const nameDecoder = makeDecoder(document.querySelector('[data-decode]'));

  const links = [...document.querySelectorAll('.nav a')];
  links.forEach(link => {
    const label = link.firstChild;
    if (!label || label.nodeType !== Node.TEXT_NODE) return;
    const roll = document.createElement('span');
    roll.className = 'nav-roll';
    const track = document.createElement('span');
    track.className = 'nav-roll-track';
    const first = document.createElement('span');
    first.textContent = label.textContent;
    const second = first.cloneNode(true);
    second.setAttribute('aria-hidden', 'true');
    track.append(first, second);
    roll.append(track);
    label.replaceWith(roll);
  });

  // Cache untransformed bounds, and coalesce pointer work into a single frame.
  function pointerMotion(element, move, clear) {
    if (!element) return;
    let bounds = null;
    let point = null;
    let frame = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      bounds = null;
      point = null;
      clear();
    };
    element.addEventListener('pointerenter', event => {
      if (canAnimate() && finePointer.matches && event.pointerType === 'mouse') bounds = element.getBoundingClientRect();
    });
    element.addEventListener('pointermove', event => {
      if (!canAnimate() || !finePointer.matches || event.pointerType !== 'mouse') return;
      if (!bounds) bounds = element.getBoundingClientRect();
      point = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!point || !bounds || !canAnimate()) return;
        move((point.x - bounds.left) / bounds.width - .5, (point.y - bounds.top) / bounds.height - .5);
      });
    });
    element.addEventListener('pointerleave', reset);
    element.addEventListener('pointercancel', reset);
    pointerResets.push(reset);
  }
  pointerMotion(hero, (x, y) => {
    hero.style.setProperty('--photo-x', `${x * 12}px`);
    hero.style.setProperty('--photo-y', `${y * 8}px`);
  }, () => {
    hero.style.removeProperty('--photo-x');
    hero.style.removeProperty('--photo-y');
  });

  cards.forEach((card, index) => {
    const front = card.querySelector('.card-front');
    const back = card.querySelector('.card-back');
    const title = front.querySelector('strong').textContent;
    back.id = `card-details-${index + 1}`;
    card.setAttribute('aria-controls', back.id);
    card.addEventListener('click', () => {
      const flipped = card.classList.toggle('is-flipped');
      card.setAttribute('aria-expanded', String(flipped));
      card.setAttribute('aria-label', flipped ? `Flip ${title} card back` : `Flip ${title} card`);
      front.setAttribute('aria-hidden', String(flipped));
      back.setAttribute('aria-hidden', String(!flipped));
      if (flipped) card.setAttribute('aria-describedby', back.id);
      else card.removeAttribute('aria-describedby');
    });
    card.addEventListener('keydown', event => {
      if (event.key === 'Escape' && card.classList.contains('is-flipped')) card.click();
    });
    pointerMotion(card, (x, y) => {
      card.style.setProperty('--card-x', `${-y * 5}deg`);
      card.style.setProperty('--card-y', `${x * 5}deg`);
    }, () => {
      card.style.removeProperty('--card-x');
      card.style.removeProperty('--card-y');
    });
  });
  finePointer.addEventListener('change', () => pointerResets.forEach(reset => reset()));

  function intro() {
    if (!hero || !canAnimate() || scrollY > 100) return;
    animate(document.querySelector('.hero-eyebrow'), [
      { opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 650, delay: 60 });
    document.querySelectorAll('.letter-slot').forEach((letter, index) => {
      animate(letter, [
        { opacity: 0, transform: 'translateY(65%) rotate(9deg) scaleY(.65)' },
        { opacity: 1, transform: 'translateY(-5%) rotate(-2deg) scaleY(1.06)', offset: .72 },
        { opacity: 1, transform: 'translateY(0) rotate(0) scaleY(1)' },
      ], { duration: 1100, delay: 130 + index * 85 });
    });
    animate(document.querySelector('.hero-period'), [
      { opacity: 0, transform: 'translateY(-45px) scale(.35)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' },
    ], { delay: 620, duration: 850 });
    animate(document.querySelector('.nameplate'), [{ opacity: 0 }, { opacity: 1 }], { delay: 540 });
    nameDecoder?.play(660);
    document.querySelectorAll('.line-rise').forEach((line, index) => {
      animate(line, [{ transform: 'translateY(115%)' }, { transform: 'translateY(0)' }], { delay: 760 + index * 130 });
    });
    animate(document.querySelector('.hero-content .button'), [
      { opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' },
    ], { delay: 1030, duration: 650 });
    animate(document.querySelector('.hero-sticker'), [
      { opacity: 0, transform: 'translate(35px, -25px) rotate(24deg) scale(1.14)' },
      { opacity: 1, transform: 'translate(0, 0) rotate(8deg) scale(1)' },
    ], { delay: 630, duration: 1100 });
  }
  function startReveals() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const words = entry.target.querySelectorAll('.heading-word');
        if (words.length) {
          words.forEach((word, index) => animate(word, [
            { opacity: 0, transform: 'translateY(90%) rotateX(-65deg)' },
            { opacity: 1, transform: 'translateY(0) rotateX(0)' },
          ], { delay: index * 85 }));
        } else if (entry.target.matches('.about-socials, .about-badges')) {
          [...entry.target.children].forEach((item, index) => animate(item, [
            { opacity: 0, transform: 'translateY(15px) scale(.92)' },
            { opacity: 1, transform: 'translateY(0) scale(1)' },
          ], { duration: 550, delay: index * 65 }));
        } else if (entry.target.matches('.identity-card')) {
          // Animate the front face without flattening the card's 3D root.
          animate(entry.target.querySelector('.card-front'), [
            { transform: 'translateY(36px) rotateZ(-2deg) scale(.97)' },
            { transform: 'translateY(0) rotateZ(0) scale(1)' },
          ], { delay: entry.target.matches('.type-card') ? 120 : 0 });
        } else {
          animate(entry.target, [{ opacity: 0, transform: 'translateY(23px)' }, { opacity: 1, transform: 'translateY(0)' }]);
        }
      });
    }, { threshold: .18 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  }

  const sectionLinks = links.filter(link => {
    const href = link.getAttribute('href');
    return href?.startsWith('#') && href.length > 1 && document.getElementById(href.slice(1));
  });
  const sections = sectionLinks.map(link => document.getElementById(link.getAttribute('href').slice(1)));
  let scrollFrame = 0;
  function updateNavigation() {
    if (!sections.length) { scrollFrame = 0; return; }
    let current = 0;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= innerHeight * .35) current = index;
    });
    if (scrollY > 0 && innerHeight + scrollY >= document.documentElement.scrollHeight - 2) current = sectionLinks.length - 1;
    sectionLinks.forEach((link, index) => {
      link.classList.toggle('is-active', index === current);
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scrollFrame = 0;
  }
  addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateNavigation);
    pointerResets.forEach(reset => reset());
  }, { passive: true });
  addEventListener('resize', () => {
    pointerResets.forEach(reset => reset());
    updateNavigation();
  }, { passive: true });
  updateNavigation();
  document.querySelectorAll('[data-year]').forEach(element => { element.textContent = new Date().getFullYear(); });
  const startHomepage = () => { intro(); startReveals(); };
  if (window.keijOpening) window.keijOpening.play({ enabled, onComplete: startHomepage });
  else startHomepage();
})();
