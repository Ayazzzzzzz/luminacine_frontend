// src/pages/Register.jsx
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import poster from "../assets/poster-regist.png";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

const handleRegister = async () => {
  if (password !== confirmPassword) {
    alert("Password tidak cocok!");
    return;
  }

  try {
    const response = await fetch("https://luminacine-be-901699795850.us-central1.run.app/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Registrasi berhasil!");
      navigate("/");
    } else {
      alert(data.message || "Registrasi gagal");
    }
  } catch (error) {
    console.error("Register error:", error);
  }
};


return (
  <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white px-4">
    <div className="flex flex-col md:flex-row bg-[#1c1c1c] p-10 rounded-xl shadow-lg w-full h-screen gap-x-20">
      
      {/* Form - 1/3 */}
      <div className="w-full md:w-1/3  ml-20 flex flex-col justify-center">
        <h2 className="text-[72px] font-serif font-bold mb-10 text-center">LuminaCine</h2>

        <input
          type="text"
          placeholder="Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-transparent border-b border-white py-3 mb-5 focus:outline-none text-[20px]"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-transparent border-b border-white py-3 mb-5 focus:outline-none text-[20px]"
        />

        <div className="relative mb-5">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-transparent border-b border-white py-3 pr-10 w-full focus:outline-none text-[20px]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="relative mb-6">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Konfirmasi Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-transparent border-b border-white py-3 pr-10 w-full focus:outline-none text-[20px]"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          onClick={handleRegister}
          className="bg-yellow-400 text-black font-bold py-3 px-6 rounded-full text-[24px] hover:bg-yellow-500"
        >
          Sign Up
        </button>

        <p className="mt-6 text-[16px] text-center">
          Already have an account?{" "}
          <Link to="/" className="underline text-white">
    Login
  </Link>
        </p>
      </div>

      {/* Poster - 2/3 */}
      <div className="w-full md:w-3/6 flex items-center justify-center">
        <img
          src={poster}
          alt="poster"
          className="rounded-lg w-full h-auto max-h-[90vh] ml-20 object-cover"
        />
      </div>
    </div>
  </div>
);

}
