import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import MovieCard from "../components/MovieCard";
import { getActorDetails, getActorMovies } from "../utils/tmdb";
import { toast } from "react-toastify";

const ActorDetailsPage = () => {
  const { id } = useParams();
  const [actor, setActor] = useState(null);
  const [movies, setMovies] = useState([]);
  const [localPage, setLocalPage] = useState(1);
  const [moviesPerPage] = useState(5);
  const [allMovies, setAllMovies] = useState([]);
  const [localTotalPages, setLocalTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActor = async () => {
    try {
      setLoading(true);
      setError(null);
      const [detailsRes, moviesRes] = await Promise.all([
        getActorDetails(id),
        getActorMovies(id, 1)
      ]);
      setActor(detailsRes);
      const cast = moviesRes.cast || [];
      setAllMovies(cast);
      setLocalTotalPages(Math.ceil(cast.length / moviesPerPage));
      setMovies(cast.slice(0, moviesPerPage));
      setLocalPage(1);
    } catch (err) {

      setError("Failed to fetch actor details");
      toast.error("Failed to load actor data");
      console.error(err);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchActor();
    }
  }, [id]);

  const handleLocalPageChange = (page) => {
    if (page >= 1 && page <= localTotalPages && page !== localPage) {
      setLocalPage(page);
      const startIndex = (page - 1) * moviesPerPage;
      setMovies(allMovies.slice(startIndex, startIndex + moviesPerPage));
    }
  };

  const renderPagination = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, localPage - delta); i <= Math.min(localTotalPages - 1, localPage + delta); i++) {
      range.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-12">
        <button
          onClick={() => handleLocalPageChange(localPage - 1)}
          disabled={localPage === 1}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Prev
        </button>
        <button
          onClick={() => handleLocalPageChange(1)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            localPage === 1 ? "bg-brand text-white" : "bg-gray-700 hover:bg-gray-600 text-white"
          }`}
        >
          1
        </button>
        {localPage > 3 && <span className="px-2 py-2 text-gray-400">...</span>}
        {range.map((page) => (
          <button
            key={page}
            onClick={() => handleLocalPageChange(page)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              localPage === page ? "bg-brand text-white" : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}
          >
            {page}
          </button>
        ))}
        {localPage < localTotalPages - 2 && <span className="px-2 py-2 text-gray-400">...</span>}
        {localTotalPages > 1 && (
          <button
            onClick={() => handleLocalPageChange(localTotalPages)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              localPage === localTotalPages ? "bg-brand text-white" : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}
          >
            {localTotalPages}
          </button>
        )}
        <button
          onClick={() => handleLocalPageChange(localPage + 1)}
          disabled={localPage === localTotalPages}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading actor details...</div>
      </div>
    );
  }

  if (error || !actor) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-2xl">{error || "Actor not found"}</div>
      </div>
    );
  }

  const profileUrl = actor.profile_path
    ? `https://image.tmdb.org/t/p/w780${actor.profile_path}`
    : "https://via.placeholder.com/300x450?text=No+Image";

  const rating = actor.popularity ? Math.round(actor.popularity) : 0;

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto mb-20">
        {/* Hero Section */}
        <section className="relative text-center">
          <div className="inline-block w-64 h-96 md:w-80 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-b from-gray-800 to-black border-8 border-white/20 mx-auto mb-8">
            <img
              src={profileUrl}
              alt={actor.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent drop-shadow-2xl">
            {actor.name}
          </h1>
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-center mb-8 text-xl text-gray-300">
            <span className="font-semibold text-2xl text-brand">
              {actor.birthday ? new Date(actor.birthday).getFullYear() : "N/A"}
            </span>
            {actor.deathday && (
              <span className="text-red-400">† {new Date(actor.deathday).getFullYear()}</span>
            )}
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-2xl">★</span>
              <span className="font-semibold text-xl">{rating}</span>
            </div>
          </div>
          {actor.biography && (
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-3xl mx-auto px-4 line-clamp-6 md:line-clamp-4">
              {actor.biography}
            </p>
          )}
        </section>
      </div>

      {/* Movies Grid */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Movies starring {actor.name}
        </h2>
        <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          Page {localPage} of {localTotalPages} (5 movies per page)
        </p>
        {movies.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-white text-xl">No movies found</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-12">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
        {renderPagination()}
      </div>
    </div>
  );
};

export default ActorDetailsPage;
