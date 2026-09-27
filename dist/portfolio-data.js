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
      id: 'project-01', title: 'Spotify-inspired Sign-Up', category: 'Application',
      summary: 'A Spotify-inspired sign-up screen built with Flutter and Dart.',
      description: 'A sign-up screen app inspired by Spotify, made with Flutter and Dart. The interface combines account creation fields with a dark visual style and green accents.',
      role: 'Flutter UI development', stack: ['Flutter', 'Dart'], image: 'assets/Spoti-app_Prjct1/ss1.PNG',
      screenshots: ['assets/Spoti-app_Prjct1/ss1.PNG', 'assets/Spoti-app_Prjct1/ss2.PNG'],
      liveUrl: 'https://spotify-signup-page-itp-107-midterm.vercel.app/', repoUrl: '', placeholder: false,
    },
    {
      id: 'project-02', title: 'Instagram-inspired Screens', category: 'Application',
      summary: 'Sign-up, sign-in, and home screens built with Flutter and Dart.',
      description: 'An Instagram-inspired app interface made with Flutter and Dart, featuring sign-up, sign-in, and home screens in a dark theme.',
      role: 'Flutter UI development', stack: ['Flutter', 'Dart'], image: 'assets/insta-app-Prjct2/ss1.PNG',
      screenshots: ['assets/insta-app-Prjct2/ss1.PNG', 'assets/insta-app-Prjct2/ss2.PNG', 'assets/insta-app-Prjct2/ss3.PNG', 'assets/insta-app-Prjct2/ss4.PNG'],
      liveUrl: 'https://instagram-dark-lab.vercel.app/', repoUrl: '', placeholder: false,
    },
    {
      id: 'project-03', title: 'PennyLedger', category: 'Website', status: 'Ongoing',
      summary: 'A personal budget tracker for expenses and savings goals. Currently in development.',
      description: 'PennyLedger is an ongoing personal budget tracker designed to make it easier to monitor expenses and view progress toward personal savings goals.',
      role: 'Project development', stack: [], image: 'assets/Pennyledger-web_Prjct3/ss1.PNG',
      screenshots: ['assets/Pennyledger-web_Prjct3/ss1.PNG', 'assets/Pennyledger-web_Prjct3/ss2.PNG'],
      liveUrl: '', repoUrl: 'https://github.com/solikeij/PennyLedger', placeholder: false,
    },
  ],
};
