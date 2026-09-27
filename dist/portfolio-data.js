'use strict';

// EDIT YOUR PORTFOLIO HERE. Paths are relative to the HTML page in dist/.
// Showcase: replace the first video entry to change the single featured edit.
// Put MP4/WebM files in assets/video/ and set src to the matching path.
// Optional poster: a JPG/WebP cover image. Playback never starts automatically.
// Projects: add your real content and optional image, liveUrl, and repoUrl.
// Empty links stay hidden. Keep placeholder: true until the entry is your real work.
window.keijContent = {
  videos: [
    {
      id: 'video-01', title: 'My Video Editing Portfolio', category: 'VIDEO EDITING / SHOWCASE',
      description: 'A collection of my video edits and cinematic visuals. A little rhythm, a little color, and my way of telling a story.',
      src: 'assets/video/My Video Editing Portfolio.mp4', poster: '', placeholder: false,
    },
  ],
  projects: [
    {
      id: 'project-01', title: 'Your website project', category: 'Website',
      summary: 'A place for your next front-end project.',
      description: 'Add the problem you wanted to solve, your design choices, and what you built.',
      role: 'Add your role', stack: [], image: '', liveUrl: '', repoUrl: '', placeholder: true,
    },
    {
      id: 'project-02', title: 'Your application project', category: 'Application',
      summary: 'A place for an application or school project.',
      description: 'Introduce the application, who it helps, its main features, and your contribution.',
      role: 'Add your role', stack: [], image: '', liveUrl: '', repoUrl: '', placeholder: true,
    },
    {
      id: 'project-03', title: 'Your design project', category: 'Design',
      summary: 'A place for a UI concept or visual design.',
      description: 'Share the idea behind the design, the process, and a few details you are proud of.',
      role: 'Add your role', stack: [], image: '', liveUrl: '', repoUrl: '', placeholder: true,
    },
  ],
};
