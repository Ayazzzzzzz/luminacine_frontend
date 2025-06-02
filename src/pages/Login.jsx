// src/pages/Login.jsx
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import poster from "../assets/poster.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    const result = await login(email, password);
  
    if (result && result.role) {
      alert("Login berhasil!");
      if (result.role === "admin") {
        navigate("/admindashboard");
      } else {
        navigate("/home");
      }
    } else {
      alert("Login gagal");
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white px-12">
      <div className="flex flex-col md:flex-row items-center justify-center gap-24 w-full max-w-7xl">
        {/* Poster */}
        <img
          src={poster}
          alt="poster"
          className="rounded-lg w-[calc(100vw*8/25)] h-[calc(100vw*11/25)] object-cover"
        />

        {/* Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <h2 className="text-[72px] font-serif font-bold mb-12 text-center">LuminaCine</h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-transparent border-b border-white py-3 mb-8 focus:outline-none text-[28px] font-light"
          />

          <div className="relative mb-8">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent border-b border-white py-3 pr-10 focus:outline-none w-full text-[28px] font-light"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white"
            >
              {showPassword ? <EyeOff size={28} /> : <Eye size={28} />}
            </button>
          </div>

          <button
            onClick={handleLogin}
            className="bg-yellow-400 text-black font-serif font-bold py-3 text-[36px] rounded-full hover:bg-yellow-500"
          >
            Login
          </button>

          <p className="mt-8 text-center text-[22px] font-nunito">
            New here? <a href="/regist" className="underline text-white">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}

