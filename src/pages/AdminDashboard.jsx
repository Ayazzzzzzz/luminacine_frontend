// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import useAuth from '../auth/useAuth'

export default function AdminDashboard() {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate()
  const [movies, setMovies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Redirect jika tidak login
  useEffect(() => {
    if (!accessToken) {
      navigate('/')
    } else if (user?.role !== 'admin') {
      navigate('/home') // arahkan ke halaman 403 atau sejenis
    }
  }, [accessToken, user, navigate])
  

  // Fetch movies
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get('https://luminacine-be-901699795850.us-central1.run.app/movies', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        setMovies(res.data.data)
        setError('')
      } catch (err) {
        console.error(err)
        setError('Failed to load movies')
        if (err.response?.status === 401) logout()
      } finally {
        setIsLoading(false)
      }
    }

    if (accessToken) fetchMovies()
  }, [accessToken, logout])

  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure to delete this movie?')
    if (!confirm) return

    try {
      await axios.delete(`https://luminacine-be-901699795850.us-central1.run.app/movies/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      setMovies(movies.filter(movie => movie.id_movie !== id))
    } catch (err) {
      alert('Failed to delete movie')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-neutral-700 bg-neutral-900">
        <h1 
          className="text-6xl font-bold font-serif text-yellow-400 cursor-pointer hover:text-yellow-500"
        >
          LMC Admin Side
        </h1>

        <div className="flex gap-3 items-center">
          <button
            onClick={() => navigate('/add')}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <span>Add Movie</span>
          </button>
          <button
            onClick={() => navigate('/schedule')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2 rounded-lg">
            Scheduling
          </button>
          <button
            onClick={() => {
              logout()
              navigate('/')
            }}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 pt-32 pb-8">
        {isLoading ? (
          <div className="text-center text-yellow-400">Loading movies...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map(movie => (
              <div key={movie.id_movie} className="bg-neutral-800 rounded-xl shadow-md relative">
              <img 
                src={movie.poster_url}
                alt={movie.title}
                className="w-full h-80 object-cover rounded-t-xl"
              />
              <div className="p-4 pb-16"> {/* Tambah padding bottom untuk ruang tombol */}
                <h3 className="text-xl font-bold truncate">{movie.title}</h3>
                <p className="text-sm text-yellow-400">{movie.genre}</p>
              </div>
              
              {/* Container tombol di pojok kanan bawah */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={() => navigate(`/edit/${movie.id_movie}`)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(movie.id_movie)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg"
                >
                  Delete
                </button>
              </div>
            </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
