// src/pages/SchedulePage.jsx
import { useEffect, useState } from 'react'
import axios from 'axios'
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom'
import useAuth from '../auth/useAuth'

export default function SchedulePage() {
  const { accessToken, user, logout } = useAuth()
  const navigate = useNavigate()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!accessToken) {
      navigate('/')
    } else if (user?.role !== 'admin') {
      navigate('/home')
    }
  }, [accessToken, user, navigate])

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get('https://luminacine-be-901699795850.us-central1.run.app/movies', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        setMovies(res.data.data)
      } catch (err) {
        if (err.response?.status === 401) logout()
      } finally {
        setLoading(false)
      }
    }

    if (accessToken) fetchMovies()
  }, [accessToken, logout])

  return (
    <div className="min-h-screen bg-neutral-900 text-white px-6 py-10">
      <div className="flex items-center gap-4 mb-10">
        <a href="/admindashboard" className="text-yellow-400">
          <ArrowLeft size={40} />
        </a>
        <h1 className="text-5xl font-bold text-yellow-400">SCHEDULE</h1>
      </div>
      {loading ? (
        <p className="text-center text-yellow-300">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map(movie => (
            <div key={movie.id_movie} className="bg-neutral-800 rounded-xl overflow-hidden shadow-lg">
              <img src={movie.poster_url} alt={movie.title} className="h-80 w-full object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-semibold">{movie.title}</h3>
                <p className="text-yellow-400 text-sm">{movie.genre}</p>
                <button
                  onClick={() => navigate(`/schedule/${movie.id_movie}`)}
                  className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded"
                >
                  Edit Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
