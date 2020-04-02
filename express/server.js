'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const PORT = 9292;
const imdb = require('./imdb');

const database_name = "WebApplicationArchitecture";
const url = "mongodb+srv://admin:admin@adrix-rplru.mongodb.net/WebApplicationArchitecture?retryWrites=true&w=majority";

mongoose.connect(url, { useNewUrlParser: true }).then(() => console.log('DB connection successful!'));;
const mySchema = new mongoose.Schema({}, {strict: false, versionKey: false, id: false}, 'movies');
const Movies = mongoose.model('movies', mySchema, 'movies');
const app = express();
const router = express.Router();

/**
 * Populate the database with the movies from the imdb actor's id 
 * using /movies/populate/idOfTheActor (ex : nm0000243 for Denzel)
 */
async function populate(req, res) {
  try {
    const id = req.params.id;
    const movies = await imdb(id);

    await Movies.insertMany(movies);

    res.status(200).json({
      Total: movies.length
     });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
}
router.route('/movies/populate/:id').get(populate);
//////////


/**
 * movies/search : Fetch the best movies sorted by metascore with default limit = 5 and default metascore = 0
 * movies/search?limit=10&metascore=77 : Fetch the 10 best movies sorted by metascore and if metascore is above 77
 * movies/id (ex : movies/tt2671706) : Fetch the movie corresponding to this id
 */

async function fetchMovieSearch(req, res) {
  try {
      const parameter = req.params.parameter;

      if(parameter == "search")
      {
        var metascore; 
        var limit;
        
        if(req.query.metascore){
          metascore = parseInt(req.query.metascore);
        }
        else 
        {
          metascore = 0;
        }
  
        if(req.query.limit) {
          limit = parseInt(req.query.limit);
        }
        else 
        {
          limit = 5;
        }
        
        const query = {metascore: {$gt: metascore}};
        const movies = await Movies.find(query).sort({metascore: -1}).limit(limit);
        res.status(200).json({
          movies
         });
      }
      else {
        const movie = await Movies.findOne({"id": parameter});
        res.status(200).json({
          movie 
        });
      } 
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
}
router.route('/movies/:parameter').get(fetchMovieSearch);
//////////

/**
 * Fetch a random must-watch movie (metascore > 70)
 */
async function fetchRandomMovie(req, res) {
  try {
    const query = {metascore: {$gt: 70}};
    const movie = await Movies.aggregate([{$match:query},{$sample: {size: 1}}]);

    res.status(200).json({
     movie
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
}
router.route('/movies').get(fetchRandomMovie);
//////////

/**
 * Add a review to the movie
 */
async function addReview(req, res) {
  try {
    const idMovie = req.params.id;
    var myReviews = req.body;
    
    var query = {id: idMovie};
    var update = {$push: {myReviews}};  
    
   await Movies.update(query, update);

    res.status(200).json({
     Saved: "done"
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
}
router.route('/movies/:id').post(addReview);
//////////

router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Bienvenue sur la site d\'Adrien Turchini.</h1>');
  res.write('<p>Vous pouvez accédez à une base de données MongoDB via les liens suivants :');
  res.write('<p>Fetch a random must-match movie : http://denzelturchini.netlify.com/.netlify/functions/server/movies </p>');
  res.write('<p>Populate the database with an Denzel\'s movies from IMDb. You can change the actor\'s id at the end of the url, nm0000243 is Denzel\'s id : http://denzelturchini.netlify.com/.netlify/functions/server/movies/populate/nm0000243</p>');
  res.end();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/.netlify/functions/server', router);
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);
