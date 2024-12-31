const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/sportsConnectDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Define Association Schema
const associationSchema = new mongoose.Schema({
    name: String,
    generatedId: String,
    password: String,
    associationType: String,
    registrationNumber: String,
    email: String,
    contactNumber: String
});

// Create Association model
const Association = mongoose.model('Association', associationSchema);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files (e.g., HTML, CSS, JavaScript files)

// Save Association (Sign-Up)
app.post('/saveAssociation', async (req, res) => {
    try {
    

        const newAssociation = new Association({
            name: req.body.name,
            generatedId: req.body.generatedId,
            password: req.body.password,
            associationType: req.body.associationType,
            registrationNumber: req.body.registrationNumber,
            email: req.body.email,
            contactNumber: req.body.contactNumber
        });

        await newAssociation.save();
        res.status(200).send('Association Saved');
    } catch (err) {
        res.status(400).send('Error saving association data: ' + err);
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, id, password, type } = req.body;

    try {
        let foundUser;

        // Determine which collection to query based on the 'type'
        if (type === 'association') {
            // Query for associations using 'name' and 'generatedId'
            foundUser = await Association.findOne({ name: username, generatedId: id });
        }
        // Add additional conditions for other types if necessary, e.g., athletes

        if (!foundUser) {
            return res.status(400).send('User not found.');
        }

        // Compare the password
        const isPasswordMatch = await bcrypt.compare(password, foundUser.password);
        if (isPasswordMatch) {
            res.status(200).send('Login successful.');
        } else {
            res.status(400).send('Invalid username or password.');
        }
    } catch (err) {
        res.status(500).send('Error logging in: ' + err);
    }
});

// Get Association Profile (Example of a GET request)
app.get('/getAssociationProfile', (req, res) => {
    const userId = req.query.userId; // e.g., ASSOC_XYZ123
    Association.findOne({ generatedId: userId }, (err, profile) => {
        if (err) return res.status(400).send('Error fetching profile');
        res.json({
            name: profile.name,
            generatedId: profile.generatedId,
            photoUrl: '/path/to/profile-photo.jpg' // Update with actual image path
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
