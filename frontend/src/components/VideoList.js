import React, { useEffect, useState } from 'react';

const VideoList = () => {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/videos');
            const data = await res.json();
            setVideos(data);
        } catch (error) {
            console.error("Error fetching videos:", error);
        }
    };

    const deleteVideo = async (id) => {
        if (window.confirm("Are you sure you want to delete this video?")) {
            try {
                await fetch(`http://localhost:5000/api/video/${id}`, { method: 'DELETE' });
                fetchVideos(); // Refresh the video list
            } catch (error) {
                console.error("Error deleting video:", error);
            }
        }
    };

    return (
        <div>
            <h2>Uploaded Videos</h2>
            {videos.length === 0 ? <p>No videos uploaded</p> : videos.map((video) => (
                <div key={video._id}>
                    <p>{video.filename}</p>
                    <video width="300" controls>
                        <source src={`http://localhost:5000/api/video/${video.filename}`} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <button onClick={() => deleteVideo(video._id)}>Delete</button>
                </div>
            ))}
        </div>
    );
};

export default VideoList;
