# keij — King James De Matta

A responsive, one-page personal portfolio inspired by the industrial frames and collectible cards in the supplied Zenless Zone Zero reference. Built in plain HTML, CSS, and JavaScript with no build step or framework.

## Open the page

Open `dist/index.html` directly in a browser, or run `node server.mjs` from this folder and visit http://127.0.0.1:4173.

## Edit

- `dist/index.html`: names, introduction, identity cards, and metadata.
- `dist/styles.css`: colors, typography, responsive layouts, and animations. The main palette is defined in `:root`.
- `dist/motion.css`: the elastic logo loop, blue signal sweep, scrolling type strip, rolling navigation, and hover effects.
- `dist/opening.css` and `dist/opening.js`: the 3.3-second full-screen opening with keij and King James De Matta, followed by the homepage entrance. Refresh the page to replay it. Skip intro or Escape opens the homepage immediately.
- `dist/portfolio-data.js`: the shared, editable video and project content.
- `dist/portfolio.css` and `dist/portfolio.js`: the single video showcase, 25-item tool gallery, social logo links, and responsive navigation/footer.
- `dist/projects.css` and `dist/projects.js`: the homepage projects section, category filters, and project detail dialogs. The old `projects.html` URL redirects to `index.html#projects`.
- `dist/script.js`: card flips, pointer movement, scroll reveals, active navigation, and the motion toggle.
- `dist/assets/king-james.jpg`: the supplied portrait, used with CSS color treatments.

Animations default to the operating system's reduced-motion preference. The header control explicitly enables or disables motion and stores the choice locally when browser storage is available. It also settles any active text scramble or entrance immediately. Motion pauses in hidden tabs. The cards work with mouse, touch, Enter, and Space; Escape returns a flipped card to its front.

Barlow, Barlow Condensed, and Space Mono are bundled locally with their font licenses, so the design also works offline. The site has no analytics, tracking scripts, form submissions, or external JavaScript dependencies.

The identity cards introduce the person and the visual direction; they do not claim fabricated projects, credentials, or contact details.

## Change the video showcase

The showcase uses your supplied `dist/assets/video/My Video Editing Portfolio.mp4`.

1. Put a replacement MP4 or WebM video in `dist/assets/video/`.
2. Open `dist/portfolio-data.js` and edit the first entry in `videos`. Set `title`, `category`, `description`, and `src`, for example `assets/video/my-reel.mp4`. The section displays one featured video.
3. Optionally set `poster` to a cover image path. The video element in `dist/index.html` is also the no-JavaScript fallback; update its `src` if you replace the file.
4. Refresh the page. The native player supports playback, volume, seeking, and fullscreen. Videos do not autoplay. The local preview server supports byte-range requests for seeking through large files.

## Add a project

Edit an entry in `projects` in `dist/portfolio-data.js`. Set the title, summary, description, role, stack array, and optional image. Add `liveUrl` and/or `repoUrl` only when those links exist; empty links remain hidden. Use the categories `Website`, `Application`, or `Design`, and set `placeholder` to `false` when ready. Duplicate an entry with a unique `id` for more projects.

The three project entries use the supplied screenshots and links; PennyLedger is marked ongoing. Set a project?s screenshots array to add images to its detail gallery, and status to show a progress badge. Social profile URLs are the ones supplied by King James. Local tool/social icons and their upstream license information are in `dist/assets/icons/`.
