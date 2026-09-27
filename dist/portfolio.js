'use strict';

(() => {
  const content = window.keijContent || { videos: [] };
  const active = new Set();
  const motionAllowed = () => document.documentElement.classList.contains('motion-enabled') && !document.hidden;
  const stopAnimations = () => { active.forEach(animation => animation.cancel()); active.clear(); };
  document.addEventListener('keij:motionchange', event => { if (!event.detail.enabled) stopAnimations(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAnimations(); });

  function enter(element, index = 0) {
    if (!motionAllowed() || !element.animate) return;
    const animation = element.animate([
      { opacity: 0, transform: 'translateY(13px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 450, delay: Math.min(index, 8) * 35, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
    active.add(animation);
    animation.finished.then(() => { active.delete(animation); animation.cancel(); }, () => active.delete(animation));
  }

  const tools = [
    ['Java', 'java', 'development', 'Language', 'Ja'],
    ['HTML', 'html', 'development', 'Markup', '</>'],
    ['CSS', 'css', 'development', 'Styling', '#'],
    ['JavaScript', 'javascript', 'development', 'Language', 'JS'],
    ['React', 'react', 'development', 'UI library', 'Re'],
    ['PHP', 'php', 'development', 'Language', 'php'],
    ['Bootstrap', 'bootstrap', 'development', 'CSS framework', 'B'],
    ['Tailwind', 'tailwind', 'development', 'CSS framework', 'Tw'],
    ['Vite', 'vite', 'development', 'Build tool', 'Vi'],
    ['MySQL', 'mysql', 'development', 'Database', 'SQL'],
    ['C++', 'cpp', 'development', 'Language', 'C++'],
    ['Kotlin', 'kotlin', 'development', 'Language', 'Kt'],
    ['Flutter', 'flutter', 'development', 'UI toolkit', 'Fl'],
    ['C#', 'csharp', 'development', 'Language', 'C#'],
    ['Git', 'git', 'development', 'Version control', 'Git'],
    ['GitHub', 'github', 'development', 'Code hosting', 'GH'],
    ['Roblox Studio', 'robloxstudio', 'development', 'Game creation', 'RS'],
    ['AWS', 'aws', 'development', 'Cloud services', 'AWS'],
    ['Figma', 'figma', 'creative', 'Interface design', 'Fi'],
    ['CapCut', 'capcut', 'creative', 'Video editing', 'Cc'],
    ['Canva', 'canva', 'creative', 'Visual design', 'Ca'],
    ['Aseprite', 'aseprite', 'creative', 'Pixel art', 'As'],
    ['Claude', 'claude', 'ai', 'AI assistant', 'Cl'],
    ['ChatGPT', 'chatgpt', 'ai', 'AI assistant', 'AI'],
    ['Gemini', 'gemini', 'ai', 'AI assistant', 'Ge'],
  ];
  const gallery = document.querySelector('#tech-grid');
  const filters = [...document.querySelectorAll('[data-tool-filter]')];
  if (gallery) {
    document.querySelectorAll('[data-tool-total]').forEach(total => { total.textContent = tools.length; });
    document.querySelector('#tool-count').textContent = `${tools.length} tools`;
    tools.forEach(([name, file, group, type, fallback]) => {
      const tile = document.createElement('li');
      tile.className = 'tech-tile';
      tile.dataset.group = group;
      const icon = document.createElement('span');
      icon.className = 'tech-icon';
      icon.setAttribute('aria-hidden', 'true');
      const text = document.createElement('span');
      text.textContent = fallback;
      const image = document.createElement('img');
      image.alt = '';
      image.width = 36;
      image.height = 36;
      image.loading = 'lazy';
      if (['capcut', 'aseprite', 'claude', 'chatgpt', 'robloxstudio', 'github'].includes(file)) image.className = 'monochrome';
      image.addEventListener('load', () => icon.classList.add('has-icon'));
      image.addEventListener('error', () => { image.remove(); icon.classList.remove('has-icon'); });
      image.src = `assets/icons/${file}.svg`;
      icon.append(text, image);
      const label = document.createElement('span');
      label.className = 'tech-name';
      label.textContent = name;
      const meta = document.createElement('span');
      meta.className = 'tech-type';
      meta.textContent = type;
      tile.append(icon, label, meta);
      gallery.append(tile);
    });
    filters.forEach(button => button.addEventListener('click', () => {
      if (button.getAttribute('aria-pressed') === 'true') return;
      stopAnimations();
      filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
      let count = 0;
      [...gallery.children].forEach(tile => {
        tile.hidden = button.dataset.toolFilter !== 'all' && tile.dataset.group !== button.dataset.toolFilter;
        if (!tile.hidden) enter(tile, count++);
      });
      document.querySelector('#tool-count').textContent = `${count} tools`;
    }));
  }

  const player = document.querySelector('#portfolio-video');
  if (!player) return;
  const screen = document.querySelector('#video-screen');
  const empty = document.querySelector('#video-empty');
  const message = document.querySelector('#video-message');
  const videos = Array.isArray(content.videos) ? content.videos : [];

  function mediaUrl(value) {
    if (!value || typeof value !== 'string') return '';
    try {
      const url = new URL(value, location.href);
      return ['http:', 'https:', 'file:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  }

  function showVideo(entry) {
    player.pause();
    player.removeAttribute('src');
    player.removeAttribute('poster');
    player.load();
    message.hidden = true;
    message.textContent = '';
    screen.removeAttribute('aria-busy');
    document.querySelector('#video-title').textContent = entry.title || 'Untitled video';
    document.querySelector('#video-category').textContent = entry.category || 'VIDEO EDITING';
    document.querySelector('#video-description').textContent = entry.description || '';
    const src = mediaUrl(entry.src);
    player.hidden = !src;
    empty.hidden = !!src;
    document.querySelector('#video-status').textContent = src ? 'PRESS PLAY' : 'COMING SOON';
    if (src) {
      const poster = mediaUrl(entry.poster);
      if (poster) player.poster = poster;
      player.setAttribute('aria-label', entry.title || 'Portfolio video');
      screen.setAttribute('aria-busy', 'true');
      player.src = src;
      player.load();
    } else if (entry.src) {
      message.textContent = 'This video link is not supported.';
      message.hidden = false;
    }
  }
  player.addEventListener('loadedmetadata', () => screen.removeAttribute('aria-busy'));
  player.addEventListener('play', () => { document.querySelector('#video-status').textContent = 'NOW PLAYING'; });
  player.addEventListener('pause', () => {
    if (player.hasAttribute('src') && !player.error) document.querySelector('#video-status').textContent = player.ended ? 'PLAY AGAIN' : 'PRESS PLAY';
  });
  player.addEventListener('error', () => {
    if (!player.hasAttribute('src')) return;
    screen.removeAttribute('aria-busy');
    document.querySelector('#video-status').textContent = 'UNAVAILABLE';
    message.textContent = 'This video couldn’t be loaded. Please try again later.';
    message.hidden = false;
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) player.pause(); });
  if (videos.length) showVideo(videos[0]);
})();
