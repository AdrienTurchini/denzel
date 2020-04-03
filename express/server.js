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
 * using /.netlify/functions/server/movies/populate/id (ex : nm0000243 for Denzel)
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
 * 2 different functionnalities with optional parameters for the search one
 * /.netlify/functions/server/movies/search : Fetch the best movies sorted by metascore with default limit = 5 and default metascore = 0
 * /.netlify/functions/server/movies/search?limit=10&metascore=77 : Fetch the 10 best movies sorted by metascore and if metascore is above 77
 * /.netlify/functions/server/movies/id (ex : tt2671706) : Fetch the movie corresponding to this id
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
        const jsonMovie = JSON.stringify(movies);
 
        res.status(200).json({
          movies
         });
         
      }
      else {
        const movie = await Movies.findOne({"id": parameter});
        var jsonMovie = JSON.stringify(movie);

    const infoTab = Layout(jsonMovie);
    const link = infoTab[0];
    const title = infoTab[1];
    const metascore = infoTab[2];
    const poster = infoTab[3];
    const rating = infoTab[4];
    const synopsis = infoTab[5];
    const votes = infoTab[6];
    const year = infoTab[7];
    const myReviewsStart = infoTab[8];
    
    res.writeHead(200, { 'Content-Type': 'text/html'});
    res.write('<h1>' + title + '</h1>');
    res.write('<p>Metascore : ' + metascore + '</p>');
    res.write('<p><a>IMDB Link : </a><a href="' + link + '">IMDB Link : ' + link + '</a></p>');
    res.write('<p>Rating : ' + rating + '</p>');
    res.write('<p>Synopsis : ' + synopsis + '</p>');
    res.write('<p>Votes : ' + votes + '</p>');
    res.write('<p>Year : ' + year + '</p>');
    res.write('<p><img src="' + poster + '"></img></p>');

    if( myReviewsStart != -1) {
      const jsonReviews = jsonMovie.substring(myReviewsStart + 13, jsonMovie.length - 3);

      const reviews = jsonReviews.split("},{");
      for(var i = 0; i < reviews.length; i++)
      {
        const date = reviews[i].substring(8,18);
        const review = reviews[i].substring(30, reviews[i].length -1);
        res.write('<p>Review ' + (i+1) + ' - ' + date + ' : ' + review + '</p>');
      }
    }
    res.end();
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
 * using /.netlify/functions/server/movies
 */
async function fetchRandomMovie(req, res) {
  try {
    const query = {metascore: {$gt: 70}};
    const movie = await Movies.aggregate([{$match:query},{$sample: {size: 1}}]);
    var jsonMovie = JSON.stringify(movie);

    const infoTab = Layout(jsonMovie);
    const link = infoTab[0];
    const title = infoTab[1];
    const metascore = infoTab[2];
    const poster = infoTab[3];
    const rating = infoTab[4];
    const synopsis = infoTab[5];
    const votes = infoTab[6];
    const year = infoTab[7];
    const myReviewsStart = infoTab[8];
    
    res.writeHead(200, { 'Content-Type': 'text/html'});
    res.write('<h1>' + title + '</h1>');
    res.write('<p>Metascore : ' + metascore + '</p>');
    res.write('<p><a>IMDB Link : </a><a href="' + link + '">IMDB Link : ' + link + '</a></p>');
    res.write('<p>Rating : ' + rating + '</p>');
    res.write('<p>Synopsis : ' + synopsis + '</p>');
    res.write('<p>Votes : ' + votes + '</p>');
    res.write('<p>Year : ' + year + '</p>');
    res.write('<p><img src="' + poster + '"></img></p>');

    if( myReviewsStart != -1) {
      const jsonReviews = jsonMovie.substring(myReviewsStart + 13, jsonMovie.length - 4);

      const reviews = jsonReviews.split("},{");
      for(var i = 0; i < reviews.length; i++)
      {
        const date = reviews[i].substring(8,18);
        const review = reviews[i].substring(30, reviews[i].length -1);
        res.write('<p>Review ' + (i+1) + ' - ' + date + ' : ' + review + '</p>');
      }
    }
    res.end();
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
 * Add a review to the movie with a post request
 * using /.netlify/functions/server/movies/:id
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

/**
 * Used to set a value to each movie attributes from a string which contains all the informations about a movie ans return those attributes in order to display them in a readable way, not json when looking for a must-watch movie or a specific movie.
 * @param {A string representation of a movie attributes } jsonMovie 
 */
function Layout(jsonMovie) {

  const values = [];

  const indexLink = /link\"/;
    const linkStart = jsonMovie.search(indexLink) + 7;
    const linkStop = jsonMovie.indexOf('",', linkStart);
    const link = jsonMovie.substring(linkStart, linkStop);
    
    const indexTitle = /title\"/;
    const titleStart = jsonMovie.search(indexTitle) + 8;
    const titleStop = jsonMovie.indexOf('",', titleStart);
    const title = jsonMovie.substring(titleStart, titleStop);

    const indexMeta = /metascore\"/;
    const metaStart = jsonMovie.search(indexMeta) + 11;
    const metaStop = jsonMovie.indexOf(',', metaStart);
    const metascore = jsonMovie.substring(metaStart, metaStop); 

    const indexPoster = /poster\"/;
    const posterStart = jsonMovie.search(indexPoster) + 9;
    const posterStop = jsonMovie.indexOf('",', posterStart);
    const poster = jsonMovie.substring(posterStart, posterStop); 

    const indexRating = /rating\"/;
    const ratingStart = jsonMovie.search(indexRating) + 8;
    const ratingStop = jsonMovie.indexOf(',', ratingStart);
    const rating = jsonMovie.substring(ratingStart, ratingStop); 

    const indexSyno = /synopsis\"/;
    const synoStart = jsonMovie.search(indexSyno) + 11;
    const synoStop = jsonMovie.indexOf(',', synoStart);
    const synopsis = jsonMovie.substring(synoStart, synoStop); 

    const indexVotes = /votes\"/;
    const votesStart = jsonMovie.search(indexVotes) + 7;
    const votesStop = jsonMovie.indexOf(',', votesStart);
    const votes = jsonMovie.substring(votesStart, votesStop); 

    const indexYear = /year\"/;
    const yearStart = jsonMovie.search(indexYear) + 6;
    const year = jsonMovie.substr(yearStart, 4); 

    const indexMyReviews = /myReviews\"/;
    const myReviewsStart = jsonMovie.search(indexMyReviews); // -1 = no reviews

    values.push(link, title, metascore, poster, rating, synopsis, votes, year, myReviewsStart);
    
    return values;
}

/**
 * Home page 
 */
router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Welcome to Adrien Turchini Denzel database.</h1>');
  res.write('<p>You can access Denzel\'s movies with the following links : ');

  res.write('<p>- Fetch a random must-match movie : <a href = http://denzelturchini.netlify.com/.netlify/functions/server/movies> http://denzelturchini.netlify.com/.netlify/functions/server/movies </a> <a href = http://localhost:9292/.netlify/functions/server/movies> http://localhost:9292/.netlify/functions/server/movies </a></p>');

  res.write('<p>- Populate the database with an Denzel\'s movies from IMDb. You can change the actor\'s id at the end of the url, nm0000243 is Denzel\'s id (only working in localhost because of netlify free account limits regarding request time - 10sec and it needs more) : <a href= http://denzelturchini.netlify.com/.netlify/functions/server/movies/populate/nm0000243> http://denzelturchini.netlify.com/.netlify/functions/server/movies/populate/nm0000243</a> <a href= http://localhost:9292/.netlify/functions/server/movies/populate/nm0000243> http://localhost:9292/.netlify/functions/server/movies/populate/nm0000243</a></p>');

  res.write('<p>- Fetch a specific movie. You can change the movie\'s id at the end of the url : <a href = http://denzelturchini.netlify.com/.netlify/functions/server/movies/tt0477080> http://denzelturchini.netlify.com/.netlify/functions/server/movies/tt0477080 </a> <a href = http://localhost:9292/.netlify/functions/server/movies/tt0477080> http://localhost:9292/.netlify/functions/server/movies/tt0477080 </a></p>');

  res.write('<p>- Search for Denzel\'s movies. This endpoint accepts the following optional query string parameters: limit - number of movies to return (default:5)metascore - filter by metascore (default: 0). The results array should be sorted by metascore in descending way. : <a href = http://denzelturchini.netlify.com/.netlify/functions/server/movies/search?limit=5&metascore=77> http://denzelturchini.netlify.com/.netlify/functions/server/movies/search?limit=5&metascore=77 </a> <a href = http://localhost:9292/.netlify/functions/server/movies/search?limit=5&metascore=77> http://localhost:9292/.netlify/functions/server/movies/search?limit=5&metascore=77 </a></p>');

  res.write('<p>- Save a watched date and a review. This endpoint needs the following post parameters: date - the watched date, review - the personal review - This is a post request, it can\'t be made from a web browser but the url is the same when looking for a specific movie : http://denzelturchini.netlify.com/.netlify/functions/server/movies/tt0477080 http://localhost:9292/.netlify/functions/server/movies/tt0477080</p>');

  res.write('<img src=https://m.media-amazon.com/images/M/MV5BMjE5NDU2Mzc3MV5BMl5BanBnXkFtZTcwNjAwNTE5OQ@@._V1_SY1000_SX750_AL_.jpg>')

  res.end();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/.netlify/functions/server', router);
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);
