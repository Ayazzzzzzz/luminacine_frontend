// src/pages/HomePage.jsx
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import useAuth from '../auth/useAuth'
import { format } from 'date-fns'

export default function HomePage() {
  const { accessToken, logout } = useAuth()
  const navigate = useNavigate()
  const [movies, setMovies] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Redirect jika tidak ada token
  useEffect(() => {
    if (!accessToken) {
      navigate('/')
    }
  }, [accessToken, navigate])

  // Fetch movies dengan authorization
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get(
          'https://luminacine-be-901699795850.us-central1.run.app/movies',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        )
        setMovies(response.data.data)
        setError('')
      } catch (error) {
        console.error('Failed to fetch movies:', error)
        setError('Failed to load movies. Please try again later.')
        if (error.response?.status === 401) {
          logout()
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (accessToken) {
      fetchMovies()
    }
  }, [accessToken, logout])

  // Handle filter
  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesYear = selectedYear ? 
      format(new Date(movie.release_date), 'yyyy') === selectedYear : true
    const matchesGenre = selectedGenre ? 
      movie.genre.toLowerCase().includes(selectedGenre.toLowerCase()) : true
    
    return matchesSearch && matchesYear && matchesGenre
  })

  // Handle logout
  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Generate tahun unik untuk filter
  const uniqueYears = [...new Set(
    movies.map(movie => format(new Date(movie.release_date), 'yyyy'))
  )].sort((a, b) => b - a)

  // Generate genre unik untuk filter
  const uniqueGenres = [...new Set(
    movies.flatMap(movie => 
      movie.genre.split(',').map(g => g.trim())
    )
  )].sort()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-yellow-400 text-2xl">Loading movies...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-red-500 text-2xl">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Navigation Header */}
      <header className="bg-neutral-900 border-b border-neutral-700 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 
            className="text-6xl font-bold font-serif text-yellow-400 cursor-pointer transition hover:text-yellow-500"
            onClick={() => navigate('/home')}
          >
            Luminacine
          </h1>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <input
                type="text"
                placeholder="Search movies..."
                className="px-4 py-2 rounded-lg bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                className="px-4 py-2 rounded-lg bg-neutral-800 text-white focus:outline-none"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">All Years</option>
                {uniqueYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                className="px-4 py-2 rounded-lg bg-neutral-800 text-white focus:outline-none"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                <option value="">All Genres</option>
                {uniqueGenres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
            
  <button
    onClick={() => navigate('/history')}
    className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold transition-transform transform hover:scale-105"
  >
    History
  </button>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg transition-transform transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map(movie => (
            <div 
              key={movie.id_movie}
              className="bg-neutral-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full h-80 object-cover rounded-t-xl"
                loading="lazy"
              />
              <div className="p-4">
                <h3 className="text-xl font-bold truncate">{movie.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-yellow-400 text-sm">
                    {movie.genre}
                  </span>
                  <span className="text-neutral-400 text-sm">
                    {format(new Date(movie.release_date), 'yyyy')}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/movies/${movie.id_movie}`)}
                  className="w-full mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded-lg transition"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMovies.length === 0 && (
          <div className="text-center py-16 text-neutral-400">
            No movies found matching your criteria
          </div>
        )}
      </main>
    </div>
  )
}