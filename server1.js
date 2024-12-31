const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection - Use 'athleteDB' database
mongoose.connect('mongodb://localhost:27017/athleteDB')
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Athlete Schema
const athleteSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  sport: String,
  height: Number,
  weight: Number,
  email: String,
  contactNumber: String,
});

// Athlete Model
const Athlete = mongoose.model('Athlete', athleteSchema);

// Save Athlete details
app.post('/saveAthlete', (req, res) => {
  const newAthlete = new Athlete({
    name: req.body.name,
    age: req.body.age,
    gender: req.body.gender,
    sport: req.body.sport,
    height: req.body.height,
    weight: req.body.weight,
    email: req.body.email,
    contactNumber: req.body.contactNumber,
  });

  newAthlete.save()
    .then(() => res.status(200).send('Athlete Saved'))
    .catch(err => res.status(400).send('Error saving athlete data: ' + err));
});

// Change the port number to 9000
app.listen(9000, () => {
  console.log('Server is running on port 9000');
});
