import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router';
import MovieCard from '../components/MovieCard';
import { searchMovies } from '../utils/tmdb';
import { toast, ToastContainer } from 'react-toastify';

const SearchPage = () => {
  const { query: queryParam } = useParams();
  const [searchParams] = useSearchParams();
  const query = queryParam || searchParams.get('q') || '';
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSearchMovies = async (page) => {
    if (!query.trim()) {
      setMovies([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await searchMovies(query, page);
      setMovies(data.results || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError('Failed to search movies. Please try again.');
      toast.error('Search failed');
      console.error(err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    fetchSearchMovies(currentPage);
  }, [queryParam, searchParams, currentPage]);


  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
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
            currentPage === 1 ? 'bg-brand text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          1
        </button>
        {currentPage > 3 && <span className="px-2 py-2 text-gray-400">...</span>}
        {range.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentPage === page ? 'bg-brand text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {page}
          </button>
        ))}
        {currentPage < totalPages - 2 && <span className="px-2 py-2 text-gray-400">...</span>}
        {totalPages > 1 && (
          <button
            onClick={() => handlePageChange(totalPages)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentPage === totalPages ? 'bg-brand text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center pt-24">
        <div className="text-white text-xl">Searching for "{query}"...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12 px-4">
      <ToastContainer position="top-right" theme="dark" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Search Results for "{query}"
          </h1>
          {movies.length === 0 && !error && (
            <p className="text-xl text-gray-400 mt-4">No movies found matching "{query}".</p>
          )}
          {error && <p className="text-xl text-red-400 mt-4">{error}</p>}
        </div>
        {movies.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-12">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;

