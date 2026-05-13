import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { searchMovies } from "../utils/tmdb";
import logo from "../assets/logo.svg";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef();
  const dropdownRef = useRef();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/popular", label: "Popular" },
    { to: "/top-rated", label: "Top Rated" },
  ];

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDropdown(true);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (value.trim()) {
      debounceRef.current = setTimeout(async () => {
        try {
          setLoading(true);
          const data = await searchMovies(value, 1);
          setSearchResults((data.results || []).slice(0, 5));
          // eslint-disable-next-line no-unused-vars
        } catch (error) {
          setSearchResults([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
    }
  }, []);

  // Outside click to hide dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleViewMore = () => {
    setShowDropdown(false);
    navigate(`/search/${encodeURIComponent(searchQuery)}`);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleMenu}
        />
      )}

      {/* Navbar */}
      <nav className="bg-black/30 backdrop-blur-xl border-b border-white/10 shadow-2xl fixed w-full z-50 top-0 supports-[backdrop-filter:blur()]:bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <img src={logo} alt="MovieHub" className="h-9 w-9" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
                  MovieHub
                </span>
              </Link>
            </div>

            {/* Desktop Menu & Search */}
            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex space-x-8">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `px-3 py-2 text-lg font-medium relative transition-all duration-300 group hover:text-white ${
                        isActive
                          ? "text-white after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-1 after:bg-gradient-to-r after:from-blue-400 after:to-purple-400 after:rounded-full after:scale-x-100"
                          : "text-gray-300 hover:text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                      } after:origin-center after:scale-x-0 hover:after:scale-x-100 after:transition-all after:duration-300`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              {/* Desktop Search */}
              <div className="max-w-sm relative">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-20 pl-3.5">
                  <svg
                    className="shrink-0 size-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search movies..."
                  className="py-3 pl-10 pr-4 block w-full bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/50"
                />
                <div ref={dropdownRef}>
                  {showDropdown && searchQuery.trim() && (
                    <div className="absolute z-50 w-full p-1 bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl mt-1">
                      <div className="max-h-72 overflow-hidden overflow-y-auto">
                        {loading ? (
                          <div className="p-4 text-center text-gray-400">
                            Searching...
                          </div>
                        ) : searchResults.length > 0 ? (
                          <>
                            {searchResults.map((movie) => {
                              const posterUrl = movie.poster_path
                                ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                                : "https://via.placeholder.com/92x92/333/fff?text=No+Image";
                              return (
                                <Link
                                  key={movie.id}
                                  to={`/movie/${movie.id}`}
                                  className="flex items-center p-3 hover:bg-white/10 rounded-lg transition-colors"
                                  onClick={() => setShowDropdown(false)}
                                >
                                  <img
                                    src={posterUrl}
                                    alt={movie.title}
                                    className="w-12 h-16 object-cover rounded mr-3 flex-shrink-0"
                                  />
                                  <div>
                                    <div className="font-medium text-white truncate">
                                      {movie.title}
                                    </div>
                                    <div className="text-sm text-gray-400 truncate">
                                      {movie.release_date?.slice(0, 4) || "N/A"}
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                            {searchResults.length === 5 && (
                              <button
                                onClick={handleViewMore}
                                className="w-full text-left p-3 text-blue-400 hover:bg-white/10 rounded-lg transition-colors font-medium"
                              >
                                View all results for "{searchQuery}"
                              </button>
                            )}
                          </>
                        ) : (
                          <div className="p-4 text-center text-gray-400 text-sm">
                            No movies found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold hover:scale-110 transition-transform ml-4">
              SA
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-20 pl-3.5">
                <svg
                  className="shrink-0 size-4 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search movies..."
                className="py-2.5 pl-10 pr-4 block w-full bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-gray-400 focus:border-blue-500/50 focus:ring-blue-500/50"
              />
              {showDropdown && searchQuery.trim() && (
                <div className="absolute z-50 w-full p-1 bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl mt-1">
                  <div className="max-h-72 overflow-hidden overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center text-gray-400">
                        Searching...
                      </div>
                    ) : searchResults.length > 0 ? (
                      <>
                        {searchResults.map((movie) => {
                          const posterUrl = movie.poster_path
                            ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                            : "https://via.placeholder.com/92x92/333/fff?text=No+Image";
                          return (
                            <Link
                              key={movie.id}
                              to={`/movie/${movie.id}`}
                              className="flex items-center p-3 hover:bg-white/10 rounded-lg transition-colors"
                              onClick={() => setShowDropdown(false)}
                            >
                              <img
                                src={posterUrl}
                                alt={movie.title}
                                className="w-12 h-16 object-cover rounded mr-3 flex-shrink-0"
                              />
                              <div>
                                <div className="font-medium text-white truncate">
                                  {movie.title}
                                </div>
                                <div className="text-sm text-gray-400 truncate">
                                  {movie.release_date?.slice(0, 4) || "N/A"}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                        {searchResults.length === 5 && (
                          <button
                            onClick={handleViewMore}
                            className="w-full text-left p-3 text-blue-400 hover:bg-white/10 rounded-lg transition-colors font-medium"
                          >
                            View all results for "{searchQuery}"
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="p-4 text-center text-gray-400 text-sm">
                        No movies found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={toggleMenu}
              className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white transition-all duration-300 hover:scale-110"
            >
              <svg
                className={`w-6 h-6 transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden origin-top-right absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl ring-1 ring-black/20 bg-black/90 backdrop-blur-xl border border-white/10 z-50">
            <div className="py-4 px-6">
              <nav className="space-y-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `block px-4 py-3 text-lg font-medium rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      } hover:shadow-lg hover:shadow-blue-500/25`
                    }
                    onClick={toggleMenu}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default NavBar;
