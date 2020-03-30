const imdb = require('../../imdb');

module.exports = function(app, db) {
// Home route
app.get("/", (req, res) => {
    res.send("Welcome to Denzel API by Adrien TURCHINI");
  });

/**
* Populate the database with the movies from the imdb actor's id
*/
app.get("/movies/populate/:id", async(request, response) => {
    const id = request.params.id;
    const movies = await imdb(id);
  collection.insert(movies, (error, result) => {
      if(error) {
          return response.status(500).send(error);
      }
        nb = result.insertedCount;
        response.send({"Total of documents inserted " : nb});
  });
});

/**
 * Fetch a random must-watch movie (metascore > 70)
 */
app.get("/movies", (request, response) => {
        var query = {metascore: {$gt: 70}};
        collection.aggregate([{$match:query},{$sample: {size: 1}}]).toArray((error, result) => {
            if(error) {
                return response.status(500).send(error);
            }
            response.send(result);     
        });
});

/**
 * Fetch a specific movie using the id after /movies
 * Or search for all Denzel movies with optional parameters limit and metascore after using /search?limit=XX&metascore=XX after /movies, without the parameters, limit = 5 and metascore = 0 by default
 * the data are sorted decreasly by metascore
 */
app.get("/movies/:parameter", (request, response) => {
    
    param = request.params.parameter;

    var _limit = request.param('limit');
    var limitParse = parseInt(_limit);

    var _metascore = request.param('metascore'); 
    var metascoreParse = parseInt(_metascore);
    
    if(metascoreParse >= 0 && metascoreParse <= 100) {
        // nothing to do, value is correct 
    }
    else {
        metascoreParse = 0;
    }

    if(limitParse >= 0) {
        // nothing to do, value is correct 
    }
    else {
        limitParse = 5;
    }

    var query = {metascore: {$gt: metascoreParse}};
    
    if(param == 'search')
    {
        collection.find(query).sort({metascore: -1}).limit(limitParse).toArray((error, result) => {
            if(error) {
                return response.status(500).send(error);
            }
            response.send(result);
        });
    }
    else {
        collection.findOne({ "id": request.params.parameter}, (error, result) => {
            if(error) {
                return response.status(500).send(error);
            }
            response.send(result);
        });
    }
});

app.post("/movies/:id", (request, response) => {
    const idMovie = request.params.id;
    var myReviews = request.body;


    var query = {id: idMovie};
    var update = {$push: {myReviews}};

    collection.update(query, update, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result.result);
    });

  
});
}
