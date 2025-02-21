import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css"; 

const App = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [file, setFile] = useState(null);

  // ✅ Fetch available videos
  const fetchVideos = async () => {
    try {
      const response = await axios.get("http://localhost:YOUR_BACKEND_PORT/api/videos");
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // ✅ Handle file selection
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // ✅ Upload file
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("File uploaded successfully!");
      setFile(null);
      fetchVideos();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Try again.");
    }
  };

  // ✅ Delete video
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        await axios.delete(`http://localhost:5000/api/video/${id}`);
        alert("Video deleted successfully!");
        fetchVideos();
        if (selectedVideo && videos.find(video => video._id === id)?.filename === selectedVideo) {
          setSelectedVideo(null);
        }
      } catch (error) {
        console.error("Error deleting video:", error);
        alert("Failed to delete the video.");
      }
    }
  };

  return (
    <div className="app-container">
      <h1>🎬 Video Streaming App</h1>

      {/* Upload Video */}
      <div className="upload-section">
        <h2>Upload a Video</h2>
        <input type="file" accept="video/*" onChange={handleFileChange} />
        <button className="upload-btn" onClick={handleUpload}>Upload</button>
      </div>

      {/* Video List */}
      <div className="video-list">
        <h2>Available Videos</h2>
        {videos.length === 0 ? (
          <p>No videos found. Please upload one.</p>
        ) : (
          <ul>
            {videos.map((video) => (
              <li key={video._id} className="video-item">
                <button className="video-btn" onClick={() => setSelectedVideo(video.filename)}>
                  {video.filename}
                </button>
                <button className="delete-btn" onClick={() => handleDelete(video._id)}>🗑 Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Video Player */}
      {selectedVideo && (
        <div className="video-player">
          <h2>Now Playing: {selectedVideo}</h2>
          <video width="640" height="360" controls>
            <source src={`http://localhost:5000/api/video/${selectedVideo}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default App;
