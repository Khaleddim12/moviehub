import React, { useState, useEffect, useRef, useCallback } from "react";
import MovieCard from "../components/MovieCard";
import { getTrendingMovies, getGenres, getUpcomingMovies } from "../utils/tmdb";
import { ToastContainer, toast } from "react-toastify";

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genres, setGenres] = useState({});
  // const [genresLoading, setGenresLoading] = useState(true);

// Upcoming states
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const upcomingGridRef = useRef(null);

  const fetchGenres = async () => {
    try {
      const data = await getGenres();
      const genreLookup = {};
      data.genres.forEach((genre) => {
        genreLookup[genre.id] = genre.name;
      });
      setGenres(genreLookup);
    } catch (error) {
      console.error("Failed to fetch genres:", error);
      toast.error("Failed to fetch genres");
    }
  };

const fetchTrendingMovies = async (page, genresLookup) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTrendingMovies(page);
      setMovies(
        (data.results || []).map((movie) => ({
          ...movie,
          genres: movie.genre_ids
            ? movie.genre_ids.map((id) => ({
                id,
                name: genresLookup[id] || "Unknown",
              }))
            : [],
        })),
      );
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      setError("Failed to fetch trending movies. Please try again.");
      toast.error("Failed to fetch movies", error);
    } finally {
      setLoading(false);
    }
  };

const fetchUpcomingMovies = async (genresLookup) => {
    try {
      const data = await getUpcomingMovies(1);
      setUpcomingMovies(
        (data.results || []).map((movie) => ({
          ...movie,
          genres: movie.genre_ids
            ? movie.genre_ids.map((id) => ({
                id,
                name: genresLookup[id] || "Unknown",
              }))
            : [],
        })),
      );
    } catch (error) {
      toast.error("Failed to fetch upcoming movies", error);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    if (Object.keys(genres).length > 0) {
      fetchTrendingMovies(currentPage, genres);
      fetchUpcomingMovies(genres);
    }
  }, [currentPage, genres]);



  // Removed page-based scroll reset


  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-12">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Prev
        </button>
        <button
          onClick={() => handlePageChange(1)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentPage === 1
              ? "bg-brand text-white"
              : "bg-gray-700 hover:bg-gray-600 text-white"
          }`}
        >
          1
        </button>
        {currentPage > 3 && (
          <span className="px-2 py-2 text-gray-400">...</span>
        )}
        {range.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentPage === page
                ? "bg-brand text-white"
                : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}
          >
            {page}
          </button>
        ))}
        {currentPage < totalPages - 2 && (
          <span className="px-2 py-2 text-gray-400">...</span>
        )}
        {totalPages > 1 && (
          <button
            onClick={() => handlePageChange(totalPages)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentPage === totalPages
                ? "bg-brand text-white"
                : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}
          >
            {totalPages}
          </button>
        )}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    );
  };

  // Drag-to-scroll handlers for mouse and touch

  const handleMouseDown = useCallback((e) => {
    setStartX(e.clientX);
    setIsDragging(true);
    if (e.target) e.target.style.userSelect = 'none';
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !upcomingGridRef.current) return;
    const deltaX = startX - e.clientX;
    upcomingGridRef.current.scrollLeft += deltaX;
    setStartX(e.clientX);
  }, [isDragging, startX]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    setStartX(touch.clientX);
    setIsDragging(true);
    e.preventDefault();
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !upcomingGridRef.current || !e.touches[0]) return;
    const touch = e.touches[0];
    const deltaX = startX - touch.clientX;
    upcomingGridRef.current.scrollLeft += deltaX;
    setStartX(touch.clientX);
    e.preventDefault();
  }, [isDragging, startX]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const scrollHandler = useCallback(() => {
    const grid = upcomingGridRef.current;
    if (!grid) return;
    const scrollLeft = grid.scrollLeft;
    setIsAtStart(scrollLeft < 50);
    setIsAtEnd(scrollLeft + grid.clientWidth >= grid.scrollWidth - 50);
    
    // Update page index for dots (snap to closest card)
    const cardWidth = 360; // approx card basis + gap
    const newPageIndex = Math.round(scrollLeft / cardWidth);
    setCurrentPageIndex(Math.max(0, Math.min(newPageIndex, Math.ceil(upcomingMovies.length / 5) - 1)));
  }, [upcomingMovies.length]);

// Removed renderUpcomingPagination

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading trending movies...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Trending Movies This Week
        </h1>
        <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          Page {currentPage} of {totalPages}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-12">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
        {renderPagination()}

        {/* Upcoming Movies Section */}
        <div className="mt-24">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Upcoming Movies
          </h2>
            {upcomingMovies.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-white text-xl">Loading upcoming movies...</div>
              </div>
            ) : (
            <div className="relative">
<div 
  ref={upcomingGridRef} 
  className={`flex overflow-x-auto gap-6 pb-12 scrollbar-hide snap-x snap-mandatory scroll-smooth max-w-full *:shrink-0 *:basis-[min(22rem,80vw)] *:snap-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
  onScroll={scrollHandler}
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseLeave={handleMouseLeave}
  onMouseUp={handleMouseUp}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}>
                {upcomingMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
              {/* Left gradient */}
              <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-gray-900/90 to-transparent pointer-events-none z-20" />
              {/* Right gradient */}
              <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-gray-900/90 to-transparent pointer-events-none z-20" />
              
              {/* Overlaid Arrows */}
              <button
                onClick={() => {
                  if (upcomingGridRef.current) {
                    upcomingGridRef.current.scrollBy({ left: -(upcomingGridRef.current.clientWidth * 0.8), behavior: 'smooth' });
                  }
                }}
                disabled={isAtStart}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/60 hover:bg-brand/80 backdrop-blur-sm text-white p-4 rounded-full text-2xl font-bold shadow-2xl hover:shadow-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 disabled:hover:scale-100 md:left-8 md:p-5 md:text-3xl"
                aria-label="Scroll left"
              >
                ←
              </button>
              <button
                onClick={() => {
                  if (upcomingGridRef.current) {
                    upcomingGridRef.current.scrollBy({ left: +(upcomingGridRef.current.clientWidth * 0.8), behavior: 'smooth' });
                  }
                }}
                disabled={isAtEnd}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/60 hover:bg-brand/80 backdrop-blur-sm text-white p-4 rounded-full text-2xl font-bold shadow-2xl hover:shadow-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 disabled:hover:scale-100 md:right-8 md:p-5 md:text-3xl"
                aria-label="Scroll right"
              >
                →
              </button>
            </div>
          )}
          
          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-8 mb-12">
            {Array.from({length: Math.ceil(upcomingMovies.length / 5)}).map((_, i) => (
              <div
                key={i}
className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                  currentPageIndex === i
                    ? 'bg-brand scale-125 shadow-lg' 
                    : 'bg-gray-600 hover:bg-gray-500 hover:scale-110'
                }`}
              />
            ))}
          </div>

          {/* Show more when at end */}
          {isAtEnd && (
            <div className="flex justify-center mt-8">
                <button
                className="px-10 py-4 bg-gradient-to-r from-brand to-purple-600 hover:from-brand/90 hover:to-purple-500 text-white rounded-xl text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
                onClick={() => toast.info("Navigate to full upcoming movies page (coming soon!)")}
              >
                Show More Upcoming Movies
              </button>
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="top-right" theme="dark" />
    </div>
  );
};

export default HomePage;
