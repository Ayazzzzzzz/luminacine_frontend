import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import useAuth from '../auth/useAuth';

export default function OrderSummaryPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { movieId, scheduleId, selectedSeats = [], isRescheduling, bookingId } = state || {};
  const { user, accessToken } = useAuth();

  const id_user = user?.id_user || user?.id || user?.userId;
  const [movie, setMovie] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const serviceFee = 5000;

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
  
    if (!movieId || !scheduleId || selectedSeats.length === 0) {
      setError('Data pemesanan tidak valid! Silakan pilih kursi kembali.');
      setLoading(false);
      return;
    }
  
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [movieRes, schedulesRes] = await Promise.all([
        axios.get(`https://luminacine-be-901699795850.us-central1.run.app/movies/${movieId}`),
        axios.get(`https://luminacine-be-901699795850.us-central1.run.app/movies/${movieId}/schedules`)
      ]);

      const foundSchedule = schedulesRes.data.data.find(s => s.id_schedule == scheduleId);
      if (!foundSchedule) throw new Error('Jadwal tidak ditemukan');

      setMovie(movieRes.data.data);
      setSchedule(foundSchedule);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Gagal memuat data film dan jadwal');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = selectedSeats.length * schedule?.price + serviceFee;

  const handleBooking = async () => {
    try {
      if (!schedule) return;

      if (!id_user || !scheduleId || !totalPrice || selectedSeats.length === 0) {
        setError('Data pemesanan tidak lengkap');
        return;
      }
      
      const bookingPayload = {
        id_user,
        id_schedule: scheduleId,
        total_price: totalPrice,
        seats: selectedSeats.map(seat => seat.id_seat || seat.id || seat.seat_id),
      };

      console.log('Booking payload:', {
        id_user,
        id_schedule: scheduleId,
        total_price: totalPrice,
        seats: selectedSeats.map(seat => seat.id_seat || seat.id || seat.seat_id),
      });

      const response = isRescheduling && bookingId
        ? await axios.put(
            `https://luminacine-be-901699795850.us-central1.run.app/bookings/${bookingId}`,
            bookingPayload,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          )
        : await axios.post(
            'https://luminacine-be-901699795850.us-central1.run.app/bookings',
            bookingPayload,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

      const newBookingId = response?.data?.data?.id_booking || bookingId;
      setOrderId(newBookingId);
      navigate(`/ticket/${newBookingId}`);
    } catch (err) {
      console.error('Booking failed:', err.response?.data || err.message);
      setError(`Gagal melakukan booking: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) return <p className="text-white p-6">Loading...</p>;
  if (error) return <p className="text-red-500 p-6">{error}</p>;
  if (!movie || !schedule) return <p className="text-white p-6">Data tidak ditemukan</p>;

  return (
     <div className="text-white min-h-screen bg-black p-6">
    <h1 className="text-3xl font-bold mb-8 text-center text-yellow-400">🧾 Order Summary</h1>

    <div className="flex flex-col md:flex-row gap-8 rounded-2xl shadow-lg p-6 bg-black-900 h-full">
      <img
        src={movie.poster_url}
        alt={movie.title}
        className="w-60 h-auto rounded-xl shadow-md object-cover"
      />

      <div className="flex-1 space-y-6">

          <div>
            <h2 className="text-2xl font-bold text-yellow-300">{movie.title}</h2>
            <p className="text-gray-400">{movie.genre} • {new Date(movie.release_date).getFullYear()}</p>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg space-y-1">
            <p className="font-semibold text-lg">{schedule.cinema_name}</p>
            <p className="text-sm text-gray-300">Studio: {schedule.studio}</p>
            <p className="text-sm text-gray-300">
              {new Date(`${schedule.date}T${schedule.time}`).toLocaleString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg space-y-2">
            <h3 className="text-xl font-semibold text-white">🎟️ Order Details</h3>
            {orderId && (
              <p className="font-mono text-yellow-400">ORDER ID: {orderId}</p>
            )}
            <p>Seat: <span className="font-semibold">{selectedSeats.map(s => s.seat_code || s.seat_label || s.label || s.id).join(', ')}</span></p>
            <div className="pt-2 border-t border-gray-600 text-sm space-y-1">
              <p>Ticket: Rp. {schedule.price.toLocaleString('id-ID')} × {selectedSeats.length}</p>
              <p>Service Fee: Rp. {serviceFee.toLocaleString('id-ID')}</p>
              <p className="font-bold text-lg pt-2 text-yellow-300">
                Total: Rp. {totalPrice.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <button
            onClick={handleBooking}
            disabled={!!orderId}
            className={`w-full py-3 px-4 rounded-lg text-black font-bold transition duration-300 ${
              orderId
                ? 'bg-green-500 cursor-default'
                : 'bg-yellow-500 hover:bg-yellow-600'
            }`}
          >
            {orderId ? '✅ BOOKING SUCCESS!' : '🎫 CONFIRM BOOKING'}
          </button>

          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
