import { Routes, Route } from "react-router-dom"; // TANPA BrowserRouter
import LoginPage from "../pages/Login";
import RegisterPage from "../pages/Regist";
import ChooseSeat from "../pages/ChooseSeat";
import ProtectedRoute from "../pages/protectedRoute";
import Register from "../pages/Regist";
import Home from "../pages/HomePage";

function RouterApp() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/chooseSeat" element={<ChooseSeat />} />
      </Route>
    </Routes>
  );
}

export default RouterApp;
