import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import barcodeImage from '../assets/barcodeboongan.png';
import useAuth from '../auth/useAuth';

export default function TicketPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { accessToken, logout } = useAuth();
  const [booking, setBooking] = useState(null);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const bookingRes = await axios.get(
          `https://luminacine-be-901699795850.us-central1.run.app/bookings/${bookingId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const bookingData = bookingRes.data.data;
        setBooking(bookingData);

        const movieRes = await axios.get(
          `https://luminacine-be-901699795850.us-central1.run.app/movies/${bookingData.schedule.id_movie}`
        );
        setMovie(movieRes.data.data);
      } catch (err) {
        setError('Gagal mengambil data tiket');
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId, accessToken, navigate, logout]);

  const handleCancel = async () => {
    const confirmCancel = window.confirm("Apakah kamu yakin ingin membatalkan pemesanan ini?");
    if (!confirmCancel) return;

    try {
      await axios.delete(
        `https://luminacine-be-901699795850.us-central1.run.app/bookings/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      alert("Pemesanan berhasil dibatalkan.");
      navigate("/home");
    } catch (err) {
      console.error("Gagal membatalkan pemesanan:", err);
      alert("Terjadi kesalahan saat membatalkan pemesanan.");
    }
  };

  if (loading) return <p className="text-white p-6">Loading...</p>;
  if (error || !booking || !movie) return <p className="text-red-500 p-6">{error || 'Data tidak ditemukan'}</p>;

  const { schedule, seats, id_booking, total_price } = booking;
  const seatList = seats.map(seat => seat.seat_code).join(', ');
  const showDate = new Date(`${schedule.date}T${schedule.time}`);

  const buttonStyle = "w-full max-w-xs py-2 font-semibold rounded-lg";

  return (
    <div className="min-h-screen bg-black text-white p-6">


      <h1 className="text-4xl font-bold mb-6"> Your Ticket</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="bg-white text-black rounded-2xl p-4 w-full lg:w-2/3 shadow-xl">
          <div className="flex gap-4">
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="w-40 h-auto rounded-lg object-cover"
            />

            <div className="flex-1">
              <h2 className="text-2xl font-bold">{movie.title}</h2>
              <p className="text-gray-500 mb-2">Show this ticket at the entrance!</p>

              <hr className="my-2 border-dashed border-gray-400" />

              <div className="grid grid-cols-2 gap-y-1 text-sm">
                <p className="font-semibold">Cinema</p>
                <p>{schedule.cinema_name}</p>
                <p className="font-semibold">Date</p>
                <p>{showDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                <p className="font-semibold">Time</p>
                <p>{showDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="font-semibold">Seat</p>
                <p>{seatList}</p>
                <p className="font-semibold">Cost</p>
                <p>Rp. {total_price.toLocaleString('id-ID')}</p>
                <p className="font-semibold">Order ID</p>
                <p>{id_booking}</p>
              </div>

              <div className="mt-4 flex justify-center">
                <img
                  src={barcodeImage}
                  alt="barcode"
                  className="w-full max-w-xs h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/3 space-y-4">
          <div className="bg-white text-black rounded-xl p-4 shadow-md">
            <p className="font-medium">📅 Reschedule</p>
            <p className="text-sm mb-2">Butuh mengatur ulang waktu perjalanan?</p>
            <button
              onClick={() => navigate(`/movies/${booking.schedule.id_movie}?reschedule=true&bookingId=${id_booking}`)}
              className={`bg-yellow-300 text-black ${buttonStyle}`}
            >
              RESCHEDULE
            </button>
          </div>

          <div className="bg-white text-black rounded-xl p-4 shadow-md">
            <p className="font-medium">❌ Batalkan Pemesanan</p>
            <p className="text-sm mb-2">Batal berangkat? Klik tombol di bawah ini.</p>
            <button onClick={handleCancel} className={`bg-red-400 text-white ${buttonStyle}`}>
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
