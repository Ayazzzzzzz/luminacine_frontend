import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Regist";
import AddMovie from "./pages/AddMovie";
import MovieSeatBooking from "./pages/ChooseSeat";
import Home from "./pages/HomePage";
import EditMovie from "./pages/EditMovie";
import AdminDashboard from "./pages/AdminDashboard";
import SchedulePage from "./pages/SchedulePage";
import EditSchedulePage from "./pages/EditSchedulePage";
import MovieDetailPage from "./pages/MovieDetailPage";
import ChooseSeatPage from "./pages/ChooseSeat";
import OrderSummaryPage from "./pages/OrderSummaryPage";
import TicketPage from "./pages/TiketPage";
import HistoryPage from "./pages/History";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/add" element={<AddMovie />} />
        <Route path="/seat" element={<MovieSeatBooking />} />
        <Route path="/regist" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/edit/:id" element={<EditMovie />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/schedule/:movieId" element={<EditSchedulePage />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />
        <Route path="/choose-seat/:scheduleId" element={<ChooseSeatPage />} />
        <Route path="/checkout" element={<OrderSummaryPage />} />
        <Route path="/movies/:movieId/schedule/:scheduleId/choose-seat" element={<ChooseSeatPage />} />
        <Route path="/ticket/:bookingId" element={<TicketPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
