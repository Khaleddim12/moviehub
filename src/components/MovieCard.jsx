import React from "react";
import { Link } from "react-router";

const MovieCard = ({ movie, compact = false }) => {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w154${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "N/A";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/R";
  const genres = movie.genres || []; // Expect array of {id, name} or strings

  return (
    <Link
      to={`/movie/${movie.id}`}
      className="group relative block bg-gray-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 w-full h-full"
    >
      {/* Poster Image */}
      <div className="relative h-80 w-full overflow-hidden bg-linear-to-b from-gray-900 to-black">
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-brand/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-sm font-semibold shadow-lg">
          ★ {rating}
        </div>
        {!compact && (
          <>
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <p className="text-white text-sm line-clamp-3 opacity-90">
                {movie.overview}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className={`p-4 ${compact ? "p-3" : "p-6"}`}>
        <h3
          className={`font-bold ${compact ? "text-lg" : "text-xl"} text-white line-clamp-1 mb-${compact ? "0" : "1"} group-hover:text-brand transition-colors`}
        >
          {movie.title}
        </h3>
        {!compact && (
          <>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <span>{year}</span>
            </div>
            {/* Genres Pills */}
            <div className="flex flex-wrap gap-2">
              {genres.slice(0, 3).map((genre, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-700/50 text-xs text-gray-300 rounded-full hover:bg-brand/50 transition-colors cursor-default"
                >
                  {typeof genre === "string" ? genre : genre.name}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </Link>
  );
};

export default MovieCard;
