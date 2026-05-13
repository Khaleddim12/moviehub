import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { getMovieDetails, getMovieCredits } from "../utils/tmdb";

import MovieCard from "../components/MovieCard";
import { toast } from "react-toastify";

const MovieDetailsPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState({ cast: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  const castGridRef = useRef(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        setError(null);
        const [detailsRes, creditsRes] = await Promise.all([
          getMovieDetails(id),
          getMovieCredits(id),
        ]);
        console.log("Movie details:", detailsRes);
        setMovie(detailsRes);
        setCredits(creditsRes);
      } catch {
        setError("Failed to fetch movie details");
        toast.error("Failed to fetch movie details");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchMovie();
  }, [id]);

  // Cast carousel handlers
  const handleMouseDown = useCallback((e) => {
    setStartX(e.clientX);
    setIsDragging(true);
    if (e.target) e.target.style.userSelect = "none";
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !castGridRef.current) return;
      const deltaX = startX - e.clientX;
      castGridRef.current.scrollLeft += deltaX;
      setStartX(e.clientX);
    },
    [isDragging, startX],
  );

  const handleMouseLeave = useCallback(() => {
    if (isDragging) setIsDragging(false);
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

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging || !castGridRef.current || !e.touches[0]) return;
      const touch = e.touches[0];
      const deltaX = startX - touch.clientX;
      castGridRef.current.scrollLeft += deltaX;
      setStartX(touch.clientX);
      e.preventDefault();
    },
    [isDragging, startX],
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Actor carousel handlers

  const scrollHandler = useCallback(() => {
    const grid = castGridRef.current;
    if (!grid) return;
    const scrollLeft = grid.scrollLeft;
    setIsAtStart(scrollLeft < 50);
    setIsAtEnd(scrollLeft + grid.clientWidth >= grid.scrollWidth - 50);
  }, []);

  const navigate = useNavigate();

  const handleActorClick = useCallback(
    (actor) => {
      navigate(`/actor/${actor.id}`);
    },
    [navigate],
  );

  const TMDB_IMAGE_GALLERY = "https://image.tmdb.org/t/p/w342";

  const galleryImages = React.useMemo(() => {
    const images = [];
    if (movie?.images?.posters) {
      movie.images.posters.slice(0, 6).forEach((img) => {
        if (img.file_path) images.push(`${TMDB_IMAGE_GALLERY}${img.file_path}`);
      });
    }
    if (movie?.images?.backdrops && images.length < 12) {
      movie.images.backdrops.slice(0, 12 - images.length).forEach((img) => {
        if (img.file_path) images.push(`${TMDB_IMAGE_GALLERY}${img.file_path}`);
      });
    }
    return images;
  }, [movie]);

  const handleKeyDown = useCallback(
    (e) => {
      if (!galleryModalOpen) return;
      if (e.key === "Escape") {
        setGalleryModalOpen(false);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentGalleryIndex((prev) =>
          prev === 0 ? galleryImages.length - 1 : prev - 1,
        );
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentGalleryIndex((prev) =>
          prev === galleryImages.length - 1 ? 0 : prev + 1,
        );
      }
    },
    [galleryModalOpen, galleryImages.length],
  );

  useEffect(() => {
    const handleGlobalKeyDown = (e) => handleKeyDown(e);
    if (galleryModalOpen) {
      window.addEventListener("keydown", handleGlobalKeyDown);
    }
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleKeyDown, galleryModalOpen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading movie details...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-2xl">
          {error || "Movie not found"}
        </div>
      </div>
    );
  }

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : `https://image.tmdb.org/t/p/original${movie.poster_path}`;

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w154${movie.poster_path}`
    : "/placeholder.svg";

  const logoUrl = movie.images?.logos?.[0]?.file_path
    ? `https://image.tmdb.org/t/p/original${movie.images.logos[0].file_path}`
    : null;

  const rating = movie.vote_average ? (movie.vote_average * 10).toFixed(0) : 0;
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "N/A";

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="relative mb-20">
          <div
            className="relative h-[50vh] md:h-[70vh] lg:h-[80vh] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black shadow-2xl"
            style={{
              backgroundImage: `url(${backdropUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />

            {/* Poster */}
            <div className="absolute bottom-0 left-6 md:left-12 lg:left-20 p-6 md:p-8 lg:p-12 w-44 md:w-56 lg:w-72 rounded-2xl shadow-2xl bg-black/50 backdrop-blur-sm border border-white/20">
              <img
                src={posterUrl}
                alt={movie.title}
                className="w-full h-72 md:h-80 lg:h-96 object-cover rounded-xl shadow-2xl"
              />
            </div>

            {/* Info Overlay */}
            <div className="absolute bottom-24 md:bottom-32 lg:bottom-40 right-6 md:right-12 lg:right-20 max-w-2xl lg:max-w-4xl text-white">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent drop-shadow-2xl leading-tight">
                {movie.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mb-6 text-lg md:text-xl text-gray-300">
                <span className="font-semibold text-2xl md:text-3xl text-brand">
                  {year}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-2xl">★</span>
                  <span className="font-semibold text-xl">{rating}%</span>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-3 mb-6">
                {movie.genres?.slice(0, 4).map((genre) => (
                  <span
                    key={genre.id}
                    className="px-4 py-2 bg-brand/20 hover:bg-brand/40 backdrop-blur-sm text-white text-sm md:text-base font-medium rounded-full transition-all duration-300 border border-brand/30 hover:scale-105"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              {/* Tagline & Overview */}
              {movie.tagline && (
                <p className="text-xl md:text-2xl italic text-gray-300 mb-4 opacity-90 font-light">
                  "{movie.tagline}"
                </p>
              )}
              <p className="text-lg md:text-xl text-gray-200 leading-relaxed line-clamp-4 md:line-clamp-3 max-w-2xl">
                {movie.overview}
              </p>
            </div>
          </div>
        </section>

        {/* Cast Section */}
        {credits.cast.length > 0 && (
          <section>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Top Cast
            </h2>
            <div className="relative">
              <div
                ref={castGridRef}
                className={`flex overflow-x-auto gap-6 pb-12 scrollbar-hide snap-x snap-mandatory scroll-smooth max-w-full *:shrink-0 *:basis-[min(12rem,30vw)] *:snap-center ${isDragging ? "cursor-grabbing" : "cursor-grab"} select-none`}
                onScroll={scrollHandler}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {credits.cast.slice(0, 20).map((actor) => {
                  const profileUrl = actor.profile_path
                    ? `https://image.tmdb.org/t/p/w276_and_h350_face${actor.profile_path}`
                    : "/placeholder.svg";
                  return (
                    <div
                      key={actor.id}
                      className="flex flex-col items-center gap-3 p-4 group w-full max-w-xs text-center hover:scale-105 transition-all duration-300 cursor-pointer"
                      onClick={() => handleActorClick(actor)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleActorClick(actor);
                        }
                      }}
                    >
                      <div className="w-32 h-44 md:w-36 md:h-48 rounded-2xl overflow-hidden shadow-xl bg-gradient-to-b from-gray-800 to-black border-4 border-white/20 group-hover:border-brand/50 hover:shadow-2xl transition-all duration-300">
                        <img
                          src={profileUrl}
                          alt={actor.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-h-[4rem] max-w-full">
                        <h4 className="font-bold text-white text-sm md:text-base line-clamp-2 leading-tight group-hover:text-brand transition-colors">
                          {actor.name}
                        </h4>
                        <p className="text-gray-400 text-xs md:text-sm line-clamp-1">
                          as {actor.character}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Gradients */}
              <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-gray-900/90 to-transparent pointer-events-none z-20" />
              <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-gray-900/90 to-transparent pointer-events-none z-20" />

              {/* Arrows */}
              <button
                onClick={() => {
                  if (castGridRef.current) {
                    castGridRef.current.scrollBy({
                      left: -(castGridRef.current.clientWidth * 0.7),
                      behavior: "smooth",
                    });
                  }
                }}
                disabled={isAtStart}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/60 hover:bg-brand/80 backdrop-blur-sm text-white p-4 md:p-5 rounded-full text-3xl md:text-4xl font-bold shadow-2xl hover:shadow-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 disabled:hover:scale-100 md:left-8 md:p-5"
                aria-label="Scroll left"
              >
                ←
              </button>
              <button
                onClick={() => {
                  if (castGridRef.current) {
                    castGridRef.current.scrollBy({
                      left: +(castGridRef.current.clientWidth * 0.7),
                      behavior: "smooth",
                    });
                  }
                }}
                disabled={isAtEnd}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/60 hover:bg-brand/80 backdrop-blur-sm text-white p-4 md:p-5 rounded-full text-3xl md:text-4xl font-bold shadow-2xl hover:shadow-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 disabled:hover:scale-100 md:right-8 md:p-5"
                aria-label="Scroll right"
              >
                →
              </button>
            </div>
          </section>
        )}

        {/* Gallery Section */}
        {galleryImages.length > 0 && (
          <section className="mt-20">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Movie Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryImages.map((src, index) => (
                <div key={index}>
                  <img
                    className="h-auto max-w-full rounded-lg shadow-md hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer"
                    src={src}
                    alt={`Gallery image ${index + 1}`}
                    loading="lazy"
                    onClick={() => {
                      setCurrentGalleryIndex(index);
                      setGalleryModalOpen(true);
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Gallery Modal */}
        {galleryModalOpen && galleryImages.length > 0 && (
          <div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setGalleryModalOpen(false)}
          >
            <button
              className="absolute top-8 right-8 z-50 bg-black/50 hover:bg-white/20 text-white text-3xl w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                setGalleryModalOpen(false);
              }}
            >
              ×
            </button>
            <button
              className="absolute left-8 top-1/2 -translate-y-1/2 z-50 bg-black/70 hover:bg-brand/80 text-white text-4xl w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 disabled:opacity-30"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentGalleryIndex((prev) =>
                  prev === 0 ? galleryImages.length - 1 : prev - 1,
                );
              }}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              className="absolute right-8 top-1/2 -translate-y-1/2 z-50 bg-black/70 hover:bg-brand/80 text-white text-4xl w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 disabled:opacity-30"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentGalleryIndex((prev) =>
                  prev === galleryImages.length - 1 ? 0 : prev + 1,
                );
              }}
              aria-label="Next image"
            >
              ›
            </button>
            <div className="max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center">
              <img
                src={galleryImages[currentGalleryIndex]}
                alt={`Gallery image ${currentGalleryIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              />
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 text-white text-lg font-medium">
              {galleryImages.length > 1 && (
                <>
                  <span>{currentGalleryIndex + 1}</span>
                  <span className="text-gray-400">/</span>
                  <span>{galleryImages.length}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Logo */}
        {logoUrl && (
          <section className="text-center mb-20">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Official Logo
            </h3>
            <img
              src={logoUrl}
              alt="Movie logo"
              className="max-w-md mx-auto rounded-xl shadow-2xl bg-black/50 p-4"
            />
          </section>
        )}
      </div>
    </div>
  );
};

export default MovieDetailsPage;
