const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require("mongodb").ObjectID;
const BodyParser = require('body-parser');
const port = 9292; 
const database_name = "WebApplicationArchitecture";
const db = require('./config/db');


const app = express();


app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));



MongoClient.connect(db.url, (err, client) => {
    if (err) return console.log(err)
    const db = client.db(database_name);
    collection = db.collection("movies");
    require('./app/routes')(app, {});
    app.listen(port, () => {
    console.log('📡 Running on port ' + port);
});

});


