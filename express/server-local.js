'use strict';

const app = require('./server');

// start the server locally using localhost:9292
// careful ! because of Netlify, the adress to fetch a must-match movie for example is not /movies but /.netlify/functions/server/movies
app.listen(9292, () => console.log('Local app listening on port 9292!'));
