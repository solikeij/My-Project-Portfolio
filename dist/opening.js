'use strict';

// Keep this title sequence independent from the homepage's ambient animation.
window.keijOpening = (() => {
  const dialog = document.querySelector('.opening-intro');
  const skip = dialog.querySelector('.opening-skip');
  const root = document.documentElement;
  const animations = new Set();
  const timers = new Set();
  let open = false;
  let complete = () => {};

  function revealHomepage() {
    const onComplete = complete;
    complete = () => {};
    onComplete();
  }

  function later(callback, delay) {
    const timer = setTimeout(() => { timers.delete(timer); callback(); }, delay);
    timers.add(timer);
  }

  function finish(moveFocus = false) {
    if (!open) return;
    open = false;
    timers.forEach(clearTimeout);
    timers.clear();
    animations.forEach(animation => animation.cancel());
    animations.clear();
    root.classList.remove('intro-running');
    if (dialog.open) dialog.close();
    if (moveFocus) document.querySelector('.brand').focus({ preventScroll: true });
    revealHomepage();
  }

  function run(element, keyframes, options = {}) {
    const animation = element.animate(keyframes, {
      duration: 850, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both', ...options,
    });
    animations.add(animation);
    return animation;
  }

  skip.addEventListener('click', () => finish(true));
  dialog.addEventListener('cancel', event => { event.preventDefault(); finish(true); });
  dialog.addEventListener('close', () => finish());

  function play({ enabled, onComplete }) {
    if (!enabled || document.hidden || (location.hash && location.hash !== '#top') || !dialog.showModal || !dialog.animate) {
      onComplete();
      return;
    }
    complete = onComplete;
    open = true;
    try {
      dialog.showModal();
      root.classList.add('intro-running');
      // Even an unexpected animation error cannot leave the modal blocking the page.
      later(() => finish(), 4500);
      run(dialog.querySelector('.opening-grid'), [{ opacity: 0 }, { opacity: .45 }], { duration: 1000 });
      run(dialog.querySelector('.opening-cross'), [
        { opacity: 0, transform: 'rotate(-100deg) scale(.4)' },
        { opacity: 1, transform: 'rotate(0) scale(1)' },
      ], { delay: 80, duration: 1000 });
      run(dialog.querySelector('.opening-eyebrow'), [
        { opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' },
      ], { delay: 160, duration: 650 });
      dialog.querySelectorAll('.opening-letter').forEach((letter, index) => {
        run(letter, [
          { opacity: 0, transform: 'translateY(75%) rotate(12deg) scaleY(.6)' },
          { opacity: 1, transform: 'translateY(-4%) rotate(-1deg) scaleY(1.04)', offset: .74 },
          { opacity: 1, transform: 'translateY(0) rotate(0) scaleY(1)' },
        ], { delay: 180 + index * 95, duration: 1000 });
      });
      run(dialog.querySelector('.opening-dot'), [
        { opacity: 0, transform: 'translateY(-70px) scale(.25)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' },
      ], { delay: 650, duration: 800 });
      dialog.querySelectorAll('.opening-name > span').forEach((word, index) => {
        run(word, [
          { opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'translateY(0)' },
        ], { delay: 1000 + index * 80, duration: 650 });
      });
      run(dialog.querySelector('.opening-rule > span'), [
        { transform: 'scaleX(0)' }, { transform: 'scaleX(1)' },
      ], { delay: 200, duration: 2350, easing: 'cubic-bezier(.4,0,.2,1)' });
      run(dialog.querySelector('.opening-caption'), [{ opacity: 0 }, { opacity: 1 }], { delay: 1400, duration: 650 });
      later(() => {
        // Start the page entrance underneath the departing title screen so it
        // never appears fully visible and then disappears to animate again.
        revealHomepage();
        run(dialog.querySelector('.opening-center'), [
          { opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-35px)' },
        ], { duration: 450 });
        run(dialog, [
          { transform: 'translateY(0)', clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)' },
          { transform: 'translateY(-101%)', clipPath: 'polygon(0 0,100% 0,100% 100%,0 80%)' },
        ], { duration: 780, easing: 'cubic-bezier(.76,0,.24,1)' });
        later(() => finish(), 790);
      }, 2550);
    } catch {
      finish();
    }
  }

  return { play, finish };
})();
