import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { format } from 'date-fns'
import useAuth from '../auth/useAuth'

export default function MovieDetailPage() {
  const { id } = useParams()
  const { accessToken, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const isReschedule = searchParams.get('reschedule') === 'true'
  const bookingId = searchParams.get('bookingId')

  const [movie, setMovie] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedScheduleId, setSelectedScheduleId] = useState(null)

  useEffect(() => {
    if (!accessToken) navigate('/')
  }, [accessToken, navigate])

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await axios.get(`https://luminacine-be-901699795850.us-central1.run.app/movies/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        setMovie(res.data.data)
      } catch (err) {
        console.error('Failed to fetch movie:', err)
      }
    }

    const fetchSchedules = async () => {
      try {
        const res = await axios.get(`https://luminacine-be-901699795850.us-central1.run.app/movies/${id}/schedules`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        setSchedules(res.data.data)
        if (res.data.data.length > 0) {
          setSelectedDate(res.data.data[0].date)
        }
      } catch (err) {
        console.error('Failed to fetch schedules:', err)
      }
    }

    fetchMovie()
    fetchSchedules()
  }, [id, accessToken])

  if (!movie) {
    return <div className="min-h-screen bg-neutral-900 text-white flex justify-center items-center">Loading...</div>
  }

  const uniqueDates = [...new Set(schedules.map(s => s.date))]
  const filteredSchedules = schedules.filter(s => s.date === selectedDate)

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <header className="bg-neutral-900 border-b border-neutral-700 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-6xl font-bold font-serif text-yellow-400 cursor-pointer" onClick={() => navigate('/home')}>
            Luminacine
          </h1>
          <div className="flex gap-4">
            <button onClick={() => logout()} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <img src={movie.poster_url} alt={movie.title} className="w-full max-w-sm rounded-xl" />

          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-2">{movie.title}</h2>
            <p className="text-neutral-400 mb-2">
              {movie.genre} ・ {format(new Date(movie.release_date), 'yyyy')}
            </p>
            <p className="mb-4">{movie.sinopsis}</p>

            <div className="flex gap-2 flex-wrap mb-4">
              {uniqueDates.map(date => (
                <button
                  key={date}
                  onClick={() => {
                    setSelectedDate(date)
                    setSelectedScheduleId(null)
                  }}
                  className={`px-4 py-2 rounded-lg border ${
                    selectedDate === date ? 'bg-yellow-400 text-black' : 'bg-neutral-800 text-white'
                  }`}
                >
                  {format(new Date(date), 'dd MMMM EEE')}
                </button>
              ))}
            </div>

            {filteredSchedules.length > 0 && (
              <>
                {Object.entries(
                  filteredSchedules.reduce((groups, schedule) => {
                    const key = `${schedule.cinema_name} - ${schedule.studio}`
                    if (!groups[key]) groups[key] = []
                    groups[key].push(schedule)
                    return groups
                  }, {})
                ).map(([groupKey, schedulesInGroup]) => (
                  <div key={groupKey} className="mb-6">
                    <p className="mb-2 font-semibold text-lg">{schedulesInGroup[0].cinema_name}</p>
                    <p className="mb-4 text-neutral-400">{schedulesInGroup[0].studio}</p>

                    <div className="flex gap-4 flex-wrap mb-2">
                      {schedulesInGroup.map(schedule => (
                        <div
                          key={schedule.id_schedule}
                          onClick={() => setSelectedScheduleId(schedule.id_schedule)}
                          className={`px-4 py-2 rounded-lg cursor-pointer ${
                            selectedScheduleId === schedule.id_schedule
                              ? 'bg-yellow-400 text-black'
                              : 'bg-neutral-800 text-white'
                          }`}
                        >
                          {schedule.time.slice(0, 5)}
                        </div>
                      ))}
                    </div>

                    <p className="text-neutral-400">
                      Rp. {schedulesInGroup[0].price.toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}

                <button
                  disabled={!selectedScheduleId}
                  onClick={async () => {
                    if (isReschedule && bookingId) {
                      try {
                        const selectedSchedule = schedules.find(s => s.id_schedule === selectedScheduleId);
                        await axios.put(`https://luminacine-be-901699795850.us-central1.run.app/bookings/${bookingId}`, {
                          id_schedule: selectedScheduleId,
                          new_price: selectedSchedule.price,
                        }, {
                          headers: { Authorization: `Bearer ${accessToken}` },
                        });
                        alert('Reschedule berhasil!');
                        navigate(`/ticket/${bookingId}`);
                      } catch (err) {
                        alert('Gagal reschedule.');
                      }
                    } else {
                      navigate(`/movies/${id}/schedule/${selectedScheduleId}/choose-seat`);
                    }
                  }}
                  className={`w-full font-bold py-3 rounded-lg text-xl ${
                    selectedScheduleId
                      ? 'bg-yellow-400 hover:bg-yellow-500 text-black'
                      : 'bg-neutral-600 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  {isReschedule ? 'Reschedule Now' : 'Book Now'}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}