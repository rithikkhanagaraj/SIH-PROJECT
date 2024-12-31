const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(cors()); // Enable CORS to allow requests from different origins
app.use(express.json()); // Parse incoming JSON requests

// MongoDB connection with the database name "serverjourney"
mongoose.connect('mongodb://localhost:27017/serverjourney')
    .then(() => console.log('MongoDB connected to serverjourney'))
    .catch(err => console.log('MongoDB connection error:', err));

// Define the post schema with binary data for files, using the collection name "serverjourney"
const postSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    files: [{
        data: {
            type: Buffer, // Store the file data as binary (Buffer)
            required: true
        },
        type: {
            type: String, // MIME type of the file (image/jpeg, etc.)
            required: true
        },
        filename: {
            type: String, // Original file name
            required: true
        }
    }]
}, { collection: 'serverjourney' }); // Specify the collection name

const post = mongoose.model('post', postSchema);

// Multer memory storage for file uploads (storing in memory, not filesystem)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
    fileFilter: (req, file, cb) => {
        // Only accept images and videos
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('File type not supported'), false);
        }
    }
});

// API to create a new post with file uploaded to MongoDB
app.post('/api/posts', upload.array('files'), async (req, res) => {
    try {
        console.log("POST request received");

        // Check if files are uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        console.log("Files received:", req.files); // Log the received files to check if they exist

        // Map the files and store them as binary data in MongoDB
        const files = req.files.map(file => ({
            data: file.buffer, // Binary data (buffer)
            type: file.mimetype, // MIME type (image/jpeg, etc.)
            filename: file.originalname // Original filename
        }));

        console.log("Files prepared for saving:", files); // Check if files are correctly mapped before saving

        const newPost = new post({
            description: req.body.description,
            files // Attach the files array
        });

        const savedPost = await newPost.save();
        console.log("Post saved successfully:", savedPost); // Log the saved post to see what's stored
        res.status(201).json({ post: savedPost });
    } catch (error) {
        console.error('Error saving post:', error);
        res.status(500).json({ error: 'Error saving post' });
    }
});

// API to retrieve all posts
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await post.find().sort({ _id: -1 });
        res.json(posts);
    } catch (error) {
        console.error('Error retrieving posts:', error);
        res.status(500).json({ error: 'Error retrieving posts' });
    }
});

// API to retrieve a specific file (image or video) for a post
app.get('/api/posts/:id/file/:fileIndex', async (req, res) => {
    try {
        const postInstance = await post.findById(req.params.id);
        if (!postInstance) {
            return res.status(404).send('Post not found');
        }

        const fileIndex = req.params.fileIndex;
        const file = postInstance.files[fileIndex]; // Dynamically retrieve the requested file
        if (!file) {
            return res.status(404).send('File not found');
        }

        res.contentType(file.type); // Set the correct MIME type (image/jpeg, video/mp4, etc.)
        res.send(file.data); // Send the binary data as a response
    } catch (error) {
        console.error('Error retrieving file:', error);
        res.status(500).json({ error: 'Error retrieving file' });
    }
});

// Start the server with error handling for port conflicts
const PORT = process.env.PORT || 9000;
app.listen(PORT, (err) => {
    if (err) {
        console.error(`Error starting server on port ${PORT}:`, err);
    } else {
        console.log(`Server running on port ${PORT}`);
    }
});
