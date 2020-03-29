/* eslint-disable no-console, no-process-exit */
const imdb = require('./imdb');
const express = require('express');
const DENZEL_IMDB_ID = 'nm0000243';
const METASCORE = 70;

async function start (actor = DENZEL_IMDB_ID, metascore = METASCORE) {
  try {
    
    console.log(`📽️  fetching filmography of ${actor}...`);
    const movies = await imdb(actor);
    const awesome = movies.filter(movie => movie.metascore >= metascore);
    console.log(`🍿 ${movies.length} movies found.`);
    console.log(`🥇 ${awesome.length} awesome movies found.`);
   
    var fs = require('fs');
    fs.writeFileSync('./denzelMovies.json', JSON.stringify(movies,null,2), (err) => {
        console.error(err);
        console.log("There was an error while writing denzelMovies.json");
    });
    console.log("📃 denzelMovies.json created with success !");

   
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}



/*
var exec = require('child_process').exec;
    var command = 'curl -H "Content-Type: application/json" --data @denzelMovies.json http://localhost:9292/movies';
    //var command2 = 'mongoimport --host Adrix-shard-0/adrix-shard-00-00-rplru.mongodb.net:27017,adrix-shard-00-01-rplru.mongodb.net:27017,adrix-shard-00-02-rplru.mongodb.net:27017 --ssl --username admin --password admin --authenticationDatabase admin --db Denzel --collection Movies --type json --file ./denzelMovies.json';
    exec(command, (err, stdout, stderr) => {
      console.log("Done");
    });
*/

    
  
const [, , id, metascore] = process.argv;

start(id, metascore);
