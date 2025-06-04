import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from "lucide-react";
import axios from 'axios'
import useAuth from '../auth/useAuth'

export default function SchedulePage() {
  const { movieId } = useParams()
  const { accessToken, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!accessToken) {
      navigate('/')
    } else if (user?.role !== 'admin') {
      navigate('/home')
    }
  }, [accessToken, user, navigate])

  const [schedules, setSchedules] = useState([])
  const [movie, setMovie] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    id_schedule: null,
    cinema_name: '',
    studio: '',
    date: '',
    time: '',
    price: ''
  })

  // Ambil data jadwal
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await axios.get(
          `https://luminacine-be-901699795850.us-central1.run.app/movies/${movieId}/schedules`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        setSchedules(res.data.data)
        setMovie(res.data.data[0]?.movie || null)
        setError('')
      } catch (err) {
        console.error(err)
        setError('Failed to load schedules')
      } finally {
        setIsLoading(false)
      }
    }

    if (accessToken) fetchSchedules()
  }, [accessToken, movieId])

  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const { id_schedule, ...payload } = formData

    try {
      if (id_schedule) {
        await axios.put(
          `https://luminacine-be-901699795850.us-central1.run.app/movies/${movieId}/schedules/${id_schedule}`,
          payload,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
      } else {
        await axios.post(
          `https://luminacine-be-901699795850.us-central1.run.app/movies/${movieId}/schedules`,
          payload,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
      }
      window.location.reload()
    } catch (err) {
      alert('Failed to submit schedule')
    }
  }

  const handleEdit = (schedule) => {
    setFormData({ ...schedule })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schedule?')) return
    try {
      await axios.delete(
        `https://luminacine-be-901699795850.us-central1.run.app/schedules/${id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      setSchedules(prev => prev.filter(s => s.id_schedule !== id))
    } catch (err) {
      alert('Failed to delete schedule')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <a href="/schedule" className="text-yellow-400">
          <ArrowLeft size={40} />
        </a>
        <h1 className="text-4xl font-bold text-yellow-400">Schedule - {movie?.title}</h1>
        <button
          onClick={() => {
            setFormData({
              id_schedule: null,
              cinema_name: '',
              studio: '',
              date: '',
              time: '',
              price: ''
            })
            setShowForm(true)
          }}
          className="bg-yellow-400 text-black font-bold px-4 py-2 rounded hover:bg-yellow-500"
        >
          + Add Schedule
        </button>
      </div>

      {isLoading ? (
        <p className="text-center text-yellow-400">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="space-y-4">
          {schedules.map(s => (
            <div
              key={s.id_schedule}
              className="bg-neutral-800 p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-bold text-lg">{s.cinema_name}</p>
                <p>{s.studio} | {s.date} at {s.time}</p>
                <p className="text-yellow-400">Rp{s.price.toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(s)}
                  className="bg-green-600 px-3 py-1 rounded hover:bg-green-700 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s.id_schedule)}
                  className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-neutral-800 p-6 rounded-lg mt-6 space-y-4"
        >
          <h2 className="text-xl font-bold">{formData.id_schedule ? 'Edit Schedule' : 'Add Schedule'}</h2>
          <input type="text" name="cinema_name" placeholder="Cinema Name" value={formData.cinema_name} onChange={handleInputChange} className="w-full px-3 py-2 bg-neutral-700 rounded" required />
          <input type="text" name="studio" placeholder="Studio" value={formData.studio} onChange={handleInputChange} className="w-full px-3 py-2 bg-neutral-700 rounded" required />
          <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-3 py-2 bg-neutral-700 rounded" required />
          <input type="time" name="time" value={formData.time} onChange={handleInputChange} className="w-full px-3 py-2 bg-neutral-700 rounded" required />
          <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleInputChange} className="w-full px-3 py-2 bg-neutral-700 rounded" required />
          <div className="flex gap-4">
            <button type="submit" className="bg-yellow-400 text-black px-4 py-2 rounded font-bold hover:bg-yellow-500">
              {formData.id_schedule ? 'Update' : 'Add'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-white hover:underline">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
