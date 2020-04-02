// DB connection
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin:admin@adrix-rplru.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true });

const express = require("express");
const cors = require('cors')
const serverless = require('serverless-http');

const app = express();
const router = express.Router();

const userSchema = mongoose.Schema({
  name: {type: String, required: true},
  email: {type: String},
});

const User = mongoose.model('User', userSchema);

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

router.get('/ping', (req, res) => {
  res.send('pong!');
});

// Get all user records
router.get('/users', (req,res) => {
  User.find()
    .then( users => res.send(users))
    .catch( err => {
      res.send(err); 
    }); 
});

// Model routes
app.use(`/.netlify/functions/api`, router);

module.exports = app;

module.exports.handler = serverless(app);