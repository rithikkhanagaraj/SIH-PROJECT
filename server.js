const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors()); // Enable CORS to allow requests from different origins
app.use(express.json()); // Parse incoming JSON requests

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/postsDB')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Define the Post schema (corrected part)
const postSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true // Ensure description is required
    },
    files: [{
        url: {
            type: String, // URL to the uploaded file
            required: true
        },
        type: {
            type: String, // MIME type of the file (image/jpeg, video/mp4, etc.)
            required: true
        }
    }]
});

const Post = mongoose.model('Post', postSchema);

// Multer storage setup to handle file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Save files with a timestamped name
    }
});

const upload = multer({ storage }); // Use this storage setup for file handling

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files from the "uploads" directory

// API to create a new post
app.post('/api/posts', upload.array('files'), async (req, res) => {
    try {
        console.log("POST request received"); // Log incoming POST request

        // Map file information for saving in the database
        const files = req.files.map(file => ({
            url: `/uploads/${file.filename}`, // Path to the uploaded file
            type: file.mimetype // MIME type (image/png, image/jpeg, etc.)
        }));

        // Create a new post in MongoDB
        const newPost = new Post({
            description: req.body.description,
            files // Save the array of file objects
        });

        await newPost.save(); // Save post to the database
        console.log("Post saved successfully");
        res.json({ post: newPost }); // Respond with the saved post
    } catch (error) {
        console.error('Error saving post:', error);
        res.status(500).json({ error: 'Error saving post' });
    }
});

// API to retrieve posts
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ _id: -1 }); // Retrieve all posts, sorted by newest first
        res.json(posts);
    } catch (error) {
        console.error('Error retrieving posts:', error);
        res.status(500).json({ error: 'Error retrieving posts' });
    }
});

// Start the server
app.listen(5000, () => console.log('Server running on port 5000'));
