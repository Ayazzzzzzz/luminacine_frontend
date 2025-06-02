import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';

const Seat = ({ seat, status, onClick }) => {
  const baseStyle = 'w-10 h-10 m-1 flex items-center justify-center rounded text-yellow-500';
  const statusStyle = {
    available: 'bg-[#3A3A3A] cursor-pointer',
    booked: 'bg-white text-black cursor-not-allowed',
    selected: 'bg-yellow-400 text-black',
  };

  return (
    <div
      onClick={status !== 'booked' ? onClick : null}
      className={`${baseStyle} ${statusStyle[status]}`}
    >
      {seat}
    </div>
  );
};

export default function ChooseSeatPage() {
  const { movieId, scheduleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const isRescheduling = queryParams.get('reschedule') === 'true';
  const bookingId = queryParams.get('bookingId');
  const oldPrice = queryParams.get('oldPrice');

  const [allSeats, setAllSeats] = useState([]);
  const [bookedSeatLabels, setBookedSeatLabels] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const scheduleRes = await axios.get(
          `https://luminacine-be-901699795850.us-central1.run.app/movies/${movieId}/schedules/${scheduleId}`
        );
        setSchedule(scheduleRes.data);

        const seatStatusRes = await axios.get(
          `https://luminacine-be-901699795850.us-central1.run.app/seats/schedule/${scheduleId}/status`
        );

        const bookedSeatsData = seatStatusRes.data.data || [];
        const bookedSeats = bookedSeatsData
          .filter(seat => seat.status === 'booked')
          .map(seat => seat.seat_code);

        setBookedSeatLabels(bookedSeats);
        setAllSeats(seatStatusRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Gagal memuat data kursi. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieId, scheduleId]);

  const toggleSeat = (seat) => {
    const isSelected = selectedSeats.some(s => s.id_seat === seat.id_seat);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id_seat !== seat.id_seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handlePay = () => {
    if (selectedSeats.length === 0) return;

    navigate('/checkout', {
      state: {
        movieId,
        scheduleId,
        selectedSeats,
        isRescheduling,
        bookingId,
        oldPrice,
      },
    });
  };

  const renderSeatRows = () => {
    if (loading) return <p className="text-white text-center py-10">Memuat kursi...</p>;
    if (error) return <p className="text-red-500 text-center py-10">{error}</p>;
    if (allSeats.length === 0) return <p className="text-white text-center py-10">Tidak ada kursi tersedia</p>;

    const rows = {};
    allSeats.forEach(seat => {
      const row = seat.seat_code.charAt(0);
      if (!rows[row]) rows[row] = [];
      rows[row].push(seat);
    });

    return Object.keys(rows).sort().map(row => (
      <div key={row} className="flex justify-center">
        {rows[row].sort((a, b) => parseInt(a.seat_code.slice(1)) - parseInt(b.seat_code.slice(1))).map(seat => {
          const status = selectedSeats.some(s => s.id_seat === seat.id_seat)
            ? 'selected'
            : bookedSeatLabels.includes(seat.seat_code)
              ? 'booked'
              : 'available';

          return (
            <Seat
              key={seat.id_seat}
              seat={seat.seat_code}
              status={status}
              onClick={() => toggleSeat(seat)}
            />
          );
        })}
      </div>
    ));
  };

  const seatPrice = schedule?.price || 0;
  const totalPrice = selectedSeats.length * seatPrice;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6">Pilih Kursi</h1>
      <div className="w-full max-w-4xl px-4">
        <div className="bg-gradient-to-r from-yellow-300 to-yellow-600 h-2 mb-2 rounded-full" />
        <div className="bg-[#1c1c1c] rounded-lg py-4 mb-4">
          {renderSeatRows()}
        </div>
        <div className="flex justify-between px-4 text-white">
          <div>
            <p className="mb-2">{selectedSeats.length} Kursi</p>
            <div className="flex space-x-4 text-sm">
              <div className="flex items-center"><div className="w-4 h-4 bg-[#3A3A3A] mr-1 rounded" />Tersedia</div>
              <div className="flex items-center"><div className="w-4 h-4 bg-white mr-1 rounded" />Terisi</div>
              <div className="flex items-center"><div className="w-4 h-4 bg-yellow-400 mr-1 rounded" />Dipilih</div>
            </div>
          </div>
          <div className="text-right">
            <p className="mb-2">Rp. {totalPrice.toLocaleString('id-ID')}</p>
            <Button
              onClick={handlePay}
              className="bg-yellow-400 text-black hover:bg-yellow-500"
              disabled={selectedSeats.length === 0 || loading}
            >
              Pay Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
