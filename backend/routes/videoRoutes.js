const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');

const router = express.Router();

// MongoDB Connection
const mongoURI = 'mongodb://localhost:27017/videoStreaming';
const conn = mongoose.createConnection(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

let gfs, gridfsBucket;
conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// Multer GridFS Storage
const storage = new GridFsStorage({
    url: mongoURI,
    options: { useNewUrlParser: true, useUnifiedTopology: true }, // Add this
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            resolve({
                filename: `${Date.now()}-${file.originalname}`, // Ensure unique filenames
                bucketName: 'uploads'
            });
        });
    }
});

const upload = multer({ storage });

// Upload Video
router.post('/upload', upload.single('file'), (req, res) => {
    res.json({ file: req.file });
});

// Get All Videos
router.get('/videos', async (req, res) => {
    try {
        const files = await gfs.files.find().toArray();

        // Filter only unique files
        const uniqueFiles = files.reduce((acc, file) => {
            if (!acc.find(f => f.filename === file.filename)) {
                acc.push(file);
            }
            return acc;
        }, []);

        res.json(uniqueFiles);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching videos' });
    }
});


// Stream Video
router.get('/video/:filename', async (req, res) => {
    try {
        const file = await gfs.files.findOne({ filename: req.params.filename });
        if (!file) return res.status(404).send('File not found');

        res.set('Content-Type', file.contentType);
        const readStream = gridfsBucket.openDownloadStream(file._id);
        readStream.pipe(res);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Video
router.delete('/video/:id', async (req, res) => {
    try {
        const fileId = new mongoose.Types.ObjectId(req.params.id);

        // Delete file metadata
        const file = await gfs.files.findOne({ _id: fileId });
        if (!file) return res.status(404).json({ error: "File not found" });

        await gridfsBucket.delete(fileId); // Deletes file + chunks

        res.json({ message: "Video deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Error deleting video: " + err.message });
    }
});

module.exports = router;
