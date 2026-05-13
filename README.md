# React Movie App (Vite + React Router)

A small movie web app built with **React**, **Vite**, and **React Router**. It fetches data from **TMDB (The Movie Database)** and includes pages for trending/upcoming movies, movie details, search, and actor details.

## Features

- Browse movies (e.g., trending / upcoming)
- Movie details page (with extra appended TMDB fields)
- Search movies
- Actor details page and actor’s movies/credits
- Toast notifications (via `react-toastify`)

## Prerequisites

- Node.js (LTS recommended)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables.

   Create a `.env` file in the project root:

   ```bash
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   ```

   The app uses `import.meta.env.VITE_TMDB_API_KEY` (see `src/utils/tmdb.js`).

## Run (development)

```bash
npm run dev
```

Then open the URL shown in the terminal (usually `http://localhost:5173`).

## Build

```bash
npm run build
```

## Preview production build

```bash
npm run preview
```

## Lint

```bash
npm run lint
```

## Notes

- If you see an error like **"TMDB API key is missing"**, ensure your `.env` file exists and contains `VITE_TMDB_API_KEY`.
- TMDB responses are fetched from: `https://api.themoviedb.org/3`.

