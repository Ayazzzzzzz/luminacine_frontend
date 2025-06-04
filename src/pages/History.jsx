// src/pages/HistoryPage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useAuth from '../auth/useAuth';
import { format } from 'date-fns';

export default function HistoryPage() {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) {
      navigate('/');
    }
  }, [accessToken, navigate]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(
          `https://luminacine-be-901699795850.us-central1.run.app/bookings/user/${user?.id_user}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const bookingsData = response.data.data;

        const bookingsWithMovies = await Promise.all(
          bookingsData.map(async (booking) => {
            try {
              const movieRes = await axios.get(
                `https://luminacine-be-901699795850.us-central1.run.app/movies/${booking.schedule.id_movie}`
              );
              return {
                ...booking,
                movie: movieRes.data.data,
              };
            } catch (movieErr) {
              console.error(`Failed to fetch movie for booking ${booking.id_booking}:`, movieErr);
              return { ...booking, movie: null };
            }
          })
        );

        setBookings(bookingsWithMovies);
        setError('');
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
        setError('Failed to load bookings. Please try again later.');
        if (error.response?.status === 401) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (accessToken && user?.id_user) {
      fetchBookings();
    }
  }, [accessToken, user?.id_user, logout]);

  const handleCancel = async (booking) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this booking?');
    if (!confirmCancel) return;

    try {
      await axios.delete(
        `https://luminacine-be-901699795850.us-central1.run.app/bookings/${booking.id_booking}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      alert('Booking cancelled successfully.');
      setBookings((prev) => prev.filter((b) => b.id_booking !== booking.id_booking));
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      alert('Failed to cancel booking.');
    }
  };

  if (isLoading) return <p className="text-center py-10 text-white">Loading...</p>;
  if (error) return <p className="text-center py-10 text-red-400">{error}</p>;
  
  return (
    <div className="min-h-screen w-full bg-black text-white">
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-10">
        <a href="/home" className="text-white-400 block mb-6">
        <ArrowLeft size={40} />
        </a>
        <h1 className="text-3xl font-bold text-center mb-6">🎟️ My Booking History</h1>
      </div>

      {bookings.length === 0 ? (
        <p className="text-center text-gray-400">You have no bookings yet.</p>
      ) : (
        bookings.map((booking) => (
          <div
            key={booking.id_booking}
            className="flex bg-gray-900 rounded-xl p-4 shadow-md mb-6 overflow-hidden"
          >
            <img
              src={booking.movie?.poster_url || '/fallback.jpg'}
              alt={booking.movie?.title}
              className="w-28 h-40 object-cover rounded-lg"
            />

            <div className="flex-1 ml-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between">
                  <h2 className="text-xl font-bold">{booking.movie?.title || 'Unknown Movie'}</h2>
                  <div className="text-right">
                    <p className="text-gray-400">Cinema</p>
                    <p className="font-bold">{booking.schedule?.cinema_name || 'Unknown'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                  <div>
                    <p className="text-gray-400">Order ID</p>
                    <p className="font-bold">{booking.id_booking}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Date</p>
                    <p className="font-bold">
                      {booking.schedule?.date
                        ? format(new Date(booking.schedule.date), 'dd MMM yyyy')
                        : '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">Cost</p>
                    <p className="font-bold">Rp {Number(booking.total_price).toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Time</p>
                    <p className="font-bold">{booking.schedule?.time || '-'}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                <button
                  onClick={() => navigate(`/ticket/${booking.id_booking}`)}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md font-semibold"
                >
                  Ticket Details
                </button>
                <button
                  onClick={() =>
                    navigate(`/movies/${booking.schedule.id_movie}?reschedule=true&bookingId=${booking.id_booking}`)
                  }
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md font-semibold"
                >
                  Reschedule
                </button>
                <button
                  onClick={() => handleCancel(booking)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ))
      )}
      </div>
    </div>
  );
}
