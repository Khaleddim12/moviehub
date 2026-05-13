
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';


if (!API_KEY) {
  throw new Error('TMDB API key is missing. Set VITE_TMDB_API_KEY in your .env file (example: VITE_TMDB_API_KEY=... )');
}



const fetchData = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US${options.params ? options.params : ''}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('TMDB Fetch Error:', error);
    throw error;
  }
};

export const getTrendingMovies = (page = 1) => 
  fetchData('/trending/movie/week', {
    params: `&page=${page}`
  });

export const getGenres = () => fetchData('/genre/movie/list');

export const getUpcomingMovies = (page = 1) => 
  fetchData('/movie/upcoming', {
    params: `&page=${page}`
  });

export const getMovieDetails = (movieId) => 
  fetchData(`/movie/${movieId}`, {
    params: '&append_to_response=images,videos'
  });


export const getMovieCredits = (movieId) => 
  fetchData(`/movie/${movieId}/credits`);

export const searchMovies = (query, page = 1) => 
  fetchData('/search/movie', {
    params: `&query=${encodeURIComponent(query)}&page=${page}`
  });

export const getActorDetails = (personId) => 
  fetchData(`/person/${personId}`, {
    params: '&append_to_response=images,movie_credits'
  });

export const getActorMovies = (personId, page = 1) => 
  fetchData(`/person/${personId}/movie_credits`, {
    params: `&page=${page}`
  });

