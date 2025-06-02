import { useEffect, useState } from 'react'
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import addicon from "../assets/add-edit.png";
import { useNavigate } from "react-router-dom";

export default function AddMovie() {
  const navigate = useNavigate();
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate('/');
    }
  }, [navigate]);  
  
  const [formData, setFormData] = useState({
    title: "",
    synopsis: "",
    genre: "",
    releaseDate: "",
    posterFile: null,
  });

  const [posterName, setPosterName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, posterFile: file });
      setPosterName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.synopsis.trim()) newErrors.synopsis = "Synopsis is required";
    if (!formData.genre.trim()) newErrors.genre = "Genre is required";
    if (!formData.releaseDate.trim()) newErrors.releaseDate = "Release date is required";
    if (!formData.posterFile) newErrors.posterFile = "Poster is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Please fill out all fields before submitting.");
      setLoading(false);
      return;
    }

    setErrors({});

    try {
      const uploadData = new FormData();
      uploadData.append("file", formData.posterFile);
      uploadData.append("upload_preset", "first_try");

      const cloudinaryRes = await axios.post(
        "https://api.cloudinary.com/v1_1/dc4mguvug/image/upload",
        uploadData
      );
      
      console.log("Cloudinary response:", cloudinaryRes.data);
      const posterUrl = cloudinaryRes.data.secure_url;

      const movieData = {
        title: formData.title,
        sinopsis: formData.synopsis,
        genre: formData.genre,
        duration: 230,
        poster_url: posterUrl,
        release_date: formData.releaseDate,
      };

      console.log(movieData);

      const response = await axios.post(
        "https://luminacine-be-901699795850.us-central1.run.app/movies",
        movieData
      );

      alert("Movie berhasil ditambahkan!");
      navigate("/admindashboard", { replace: true });
      setFormData({
        title: "",
        synopsis: "",
        genre: "",
        releaseDate: "",
        posterFile: null,
      });
      setPosterName("");
    } catch (error) {
      console.error("Gagal:", error);
      alert("Gagal menambahkan movie");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1c1c1c] text-white px-8 py-12">
      <div className="flex flex-col md:flex-row items-start justify-between gap-16 w-full max-w-7xl">
        <div className="w-full md:w-2/3 ml-6">
          <div className="flex items-center gap-2 mt-0 mb-2">
            <a href="/admindashboard" className="text-yellow-400">
              <ArrowLeft size={40} />
            </a>
            <h1 className="text-yellow-400 text-[48px] font-serif font-bold">ADD MOVIE</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-black">
            <div>
              <label className="block text-white mb-1">Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Type movie name"
                className="w-full bg-[#f1f1f1] rounded-md px-3 py-3 text-[16px] placeholder-gray-500"
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-white mb-1">Synopsis</label>
              <textarea
                name="synopsis"
                value={formData.synopsis}
                onChange={handleChange}
                placeholder="Type movie synopsis"
                rows={4}
                className="w-full h-16 bg-[#f1f1f1] rounded-md px-4 py-3 text-[16px] placeholder-gray-500"
              />
              {errors.synopsis && <p className="text-red-400 text-sm mt-1">{errors.synopsis}</p>}
            </div>

            <div>
              <label className="block text-white mb-1">Genre</label>
              <input
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                placeholder="Type movie genres"
                className="w-full bg-[#f1f1f1] rounded-md px-4 py-3 text-[16px] placeholder-gray-500"
              />
              {errors.genre && <p className="text-red-400 text-sm mt-1">{errors.genre}</p>}
            </div>

            <div>
              <label className="block text-white mb-1">Release Date</label>
              <input
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleChange}
                type="date"
                className="w-full bg-[#f1f1f1] rounded-md px-4 py-3 text-[16px] placeholder-gray-500"
              />
              {errors.releaseDate && <p className="text-red-400 text-sm mt-1">{errors.releaseDate}</p>}
            </div>

            <div>
              <label className="block text-white mb-1">Poster Upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full bg-[#f1f1f1] rounded-md px-4 py-3 text-[16px] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-black hover:file:bg-yellow-500"
              />
              {posterName && (
                <p className="mt-2 text-white text-sm italic">
                  Selected file: {posterName}
                </p>
              )}
              {errors.posterFile && <p className="text-red-400 text-sm mt-1">{errors.posterFile}</p>}
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-10 rounded-md text-[16px]"
              >
                {loading ? "Uploading..." : "ADD MOVIE"}
              </button>
            </div>
          </form>
        </div>

        <div className="hidden md:flex md:w-1/3 flex-col justify-center items-center space-y-8">
          <img
            src={addicon}
            alt="poster"
            className="w-[670px] h-[640px] object-contain"
          />
        </div>
      </div>
    </div>
  );
}
