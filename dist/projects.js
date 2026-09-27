'use strict';

(() => {
  const grid = document.querySelector('#project-grid');
  const dialog = document.querySelector('.project-dialog');
  if (!grid || !dialog) return;

  const projects = Array.isArray(window.keijContent?.projects) ? window.keijContent.projects.filter(project => project && typeof project === 'object') : [];
  const filters = [...document.querySelectorAll('.project-filter')];
  const count = document.querySelector('.project-count');
  const empty = document.querySelector('.projects-empty');
  const placeholderNote = document.querySelector('[data-placeholder-note]');
  const activeAnimations = new Map();
  let previousFocus = null;

  const motionAllowed = () => document.documentElement.classList.contains('motion-enabled') && !document.documentElement.classList.contains('motion-paused') && !document.hidden;
  function stopAnimation(element) {
    const animation = activeAnimations.get(element);
    if (!animation) return;
    activeAnimations.delete(element);
    animation.cancel();
  }
  function stopAnimations() {
    activeAnimations.forEach(animation => animation.cancel());
    activeAnimations.clear();
  }
  function animate(element, keyframes, options = {}) {
    stopAnimation(element);
    if (!motionAllowed() || !element?.animate) return;
    const animation = element.animate(keyframes, { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both', ...options });
    activeAnimations.set(element, animation);
    const release = () => {
      if (activeAnimations.get(element) === animation) activeAnimations.delete(element);
      animation.cancel();
    };
    animation.finished.then(release, release);
  }
  function enterCard(card, index) {
    if (card.contains(document.activeElement)) return;
    animate(card, [
      { opacity: .45, transform: 'translateY(14px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], { delay: Math.min(index, 5) * 55 });
  }
  document.addEventListener('keij:motionchange', event => { if (!event.detail.enabled) stopAnimations(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAnimations(); });

  const text = (value, fallback = '') => typeof value === 'string' && value.trim() ? value.trim() : fallback;
  const create = (tag, className, value) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
  };

  function safeWebUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value);
      return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
    } catch { return null; }
  }

  function safeImageUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, document.baseURI);
      const allowed = ['http:', 'https:'].includes(url.protocol) || (location.protocol === 'file:' && url.protocol === 'file:');
      return allowed && !url.username && !url.password ? url.href : null;
    } catch { return null; }
  }

  function openProject(project, trigger) {
    previousFocus = trigger;
    const title = text(project.title, 'Untitled project');
    const category = text(project.category, 'Project');
    const placeholder = project.placeholder === true;
    dialog.querySelector('[data-dialog-category]').textContent = `${category.toUpperCase()} / PROJECT FILE`;
    dialog.querySelector('#project-dialog-title').textContent = title;
    dialog.querySelector('[data-dialog-summary]').textContent = text(project.summary, 'Project details are being added.');
    dialog.querySelector('[data-dialog-description]').textContent = text(project.description, placeholder ? 'This is an editable project placeholder. An overview of the project, its purpose, and the process will be added here.' : 'The project overview will be added here.');
    dialog.querySelector('[data-dialog-role]').textContent = text(project.role, 'Role to be added.');
    const status = dialog.querySelector('[data-dialog-status]');
    status.hidden = !placeholder;
    status.textContent = placeholder ? 'Placeholder — details to be added' : '';

    const stack = dialog.querySelector('[data-dialog-stack]');
    const tools = Array.isArray(project.stack) ? project.stack.map(value => text(value)).filter(Boolean) : [];
    stack.replaceChildren(...(tools.length ? tools.map(tool => create('li', '', tool)) : [create('li', 'is-pending', 'Tools to be added.')]));

    const links = dialog.querySelector('[data-dialog-links]');
    links.replaceChildren();
    [[project.liveUrl, 'Live project'], [project.repoUrl, 'Source code']].forEach(([value, label]) => {
      const href = safeWebUrl(value);
      if (!href) return;
      const link = create('a', '', label);
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const arrow = create('span', '', '↗');
      arrow.setAttribute('aria-hidden', 'true');
      link.append(arrow);
      links.append(link);
    });
    links.hidden = !links.childElementCount;
    dialog.querySelector('[data-dialog-pending]').hidden = Boolean(links.childElementCount);
    dialog.showModal();
    document.body.classList.add('project-dialog-open');
    dialog.scrollTop = 0;
    animate(dialog.querySelector('.project-dialog-body'), [
      { opacity: .5, transform: 'translateY(10px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 340 });
  }

  const cards = projects.map((project, index) => {
    const title = text(project.title, `Project ${index + 1}`);
    const category = text(project.category, 'Project');
    const card = create('article', 'project-card');
    card.dataset.category = category;
    const visual = create('div', 'project-visual');
    visual.setAttribute('aria-hidden', 'true');
    visual.append(create('span', 'project-art'), create('span', 'project-visual-number', String(index + 1).padStart(2, '0')));
    const imageUrl = safeImageUrl(project.image);
    if (imageUrl) {
      const image = create('img', 'project-image');
      image.alt = '';
      image.loading = 'lazy';
      image.decoding = 'async';
      image.addEventListener('error', () => image.remove(), { once: true });
      image.src = imageUrl;
      visual.append(image);
    }
    visual.append(create('span', 'project-visual-label', project.placeholder === true ? 'PROJECT SLOT / CONTENT TO COME' : `${category.toUpperCase()} / ${String(index + 1).padStart(2, '0')}`));
    const content = create('div', 'project-card-content');
    const topline = create('div', 'project-card-topline');
    topline.append(create('span', '', category.toUpperCase()));
    if (project.placeholder === true) topline.append(create('span', 'project-placeholder', 'Placeholder'));
    const heading = create('h3', '', title);
    const summary = create('p', 'project-card-summary', text(project.summary, 'Project details are being added.'));
    const button = create('button', 'project-open');
    button.type = 'button';
    button.setAttribute('aria-label', `View details for ${title}`);
    button.setAttribute('aria-haspopup', 'dialog');
    button.append(create('span', '', 'VIEW DETAILS'));
    const arrow = create('span', '', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    button.append(arrow);
    button.addEventListener('click', () => openProject(project, button));
    card.addEventListener('focusin', () => stopAnimation(card));
    content.append(topline, heading, summary, button);
    card.append(visual, content);
    return card;
  });
  grid.replaceChildren(...cards);

  function filterProjects(category, animateChange = false) {
    let visible = 0;
    let visiblePlaceholders = 0;
    cards.forEach((card, index) => {
      stopAnimation(card);
      const show = category === 'All' || card.dataset.category === category;
      card.hidden = !show;
      if (show) {
        if (animateChange) enterCard(card, visible);
        visible += 1;
        if (projects[index].placeholder === true) visiblePlaceholders += 1;
      }
    });
    filters.forEach(button => {
      const selected = button.dataset.filter === category;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    count.textContent = `${visible} ${visible === 1 ? 'item' : 'items'}${visiblePlaceholders ? ` / ${visiblePlaceholders} ${visiblePlaceholders === 1 ? 'placeholder' : 'placeholders'}` : ''}`;
    empty.hidden = visible > 0;
    placeholderNote.hidden = visiblePlaceholders === 0;
  }

  filters.forEach(button => button.addEventListener('click', () => {
    if (button.getAttribute('aria-pressed') === 'true') return;
    filterProjects(button.dataset.filter, true);
    animate(button, [{ transform: 'translateY(2px)' }, { transform: 'translateY(0)' }], { duration: 220 });
  }));
  dialog.addEventListener('close', () => {
    stopAnimation(dialog.querySelector('.project-dialog-body'));
    document.body.classList.remove('project-dialog-open');
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    previousFocus = null;
  });
  let pointerStartedOutside = false;
  const isOutsideDialog = event => {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  };
  dialog.addEventListener('pointerdown', event => { pointerStartedOutside = event.target === dialog && isOutsideDialog(event); });
  dialog.addEventListener('click', event => {
    if (pointerStartedOutside && event.target === dialog && isOutsideDialog(event)) dialog.close();
    pointerStartedOutside = false;
  });
  filterProjects('All');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      cards.filter(card => !card.hidden).forEach(enterCard);
    }, { threshold: .12 });
    observer.observe(grid);
  }
})();
