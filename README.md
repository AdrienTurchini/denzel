# DENZEL

This project can be run in local with port 9292 using the command npm start in the root directory of the project. 
You can also make request or go to the web pages online without running anything thanks to Netlify.

Regarding to Netlify, the request time limit for free account is 10 seconds. This is less than the time required to populate the database with Denzel's movies so it won't work with Netlify but will using localhost:9292.

You can make curl request using the shell or a client as insomnia or even use a web browser except for the post request. 

The request will return json for /movies/search, /movies/populate/:id, /movies/:id (post request).
The request will return an html page for /, /movies, /movies/:id (get request) in order for the informations to be readable.

You can add optionnal parameters to the /movies/search request : limit (default = 5) and metascore (default = 0).

In order to put the API online using netlify, the url are not /movies/xxxx but /.netlify/functions/server/movies/xxxx
I've made some redirections when using netlify only. You will access .netlify/movies/functions/server/movies, .netlify/movies/functions/server/movies/:id and .netlify/movies/functions/server/movies/search if you search for /movies, /movies/:id and /movies/search but redirections won't work with query parameters for search (?limit=xx&metascore=xx because it can not be set with Netlify).

Netlify is working well but for testing I suggest you to try using localhost because I've constated that Netlify doesn't always reponsing properly or loading elements correctly (poster etc.)

You can find a "menu" with explanations for each url at http://denzelturchini.netlify.com/.netlify/functions/server or http://localhost:9292/.netlify/functions/server using localhost.

```sh
online --
curl http://denzelturchini.netlify.com/.netlify/functions/server/movies
curl http://denzelturchini.netlify.com/.netlify/functions/server/movies/tt0477080
curl http://denzelturchini.netlify.com/.netlify/functions/server/movies/search?limit=5&metascore=77
curl http://denzelturchini.netlify.com/.netlify/functions/server/movies/populate/nm0000243 -- not working because of Netlify free account limits
curl -X POST -d '{"date": "2019-03-04", "review": "Very good movie"}' -H "Content-Type: application/json" http://denzelturchini.netlify.com/.netlify/functions/server/movies/tt0477080

local --
curl http://localhost:9292/.netlify/functions/server/movies
curl http://localhost:9292/.netlify/functions/server/movies/tt0477080
curl http://localhost:9292/.netlify/functions/server/movies/search?limit=5&metascore=77
curl http://localhost:9292/.netlify/functions/server/movies/populate/nm0000243
curl -X POST -d '{"date": "2019-03-04", "review": "Very good movie"}' -H "Content-Type: application/json" http://localhost:9292/.netlify/functions/server/movies/tt0477080
```


> The must-watch Denzel's movies

![denzel](https://m.media-amazon.com/images/M/MV5BMjE5NDU2Mzc3MV5BMl5BanBnXkFtZTcwNjAwNTE5OQ@@._V1_SY1000_SX750_AL_.jpg)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [🐣 Introduction](#-introduction)
- [🎯 Objectives](#-objectives)
- [👩‍💻 Just tell me what to do](#%E2%80%8D-just-tell-me-what-to-do)
- [Definition and Configuration](#definition-and-configuration)
  - [Definition](#definition)
  - [Suggested node modules](#suggested-node-modules)
  - [Bootstrap the server](#bootstrap-the-server)
- [🏃‍♀️ Steps to do](#%E2%80%8D-steps-to-do)
  - [REST endpoints to implement](#rest-endpoints-to-implement)
    - [`GET /movies/populate`](#get-moviespopulate)
    - [`GET /movies`](#get-movies)
    - [`GET /movies/:id`](#get-moviesid)
    - [`GET /movies/search`](#get-moviessearch)
    - [POST /movies/:id](#post-moviesid)
  - [GraphQL endpoints to implement](#graphql-endpoints-to-implement)
    - [(A suggested) Schema](#a-suggested-schema)
  - [Bonus - The Client side](#bonus---the-client-side)
- [🛣️ Related course](#-related-course)
- [Licence](#licence)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## 🐣 Introduction

Denzel Washington is one of my favorite actor.

He won 2 Oscars. [Another 83 wins & 169 nominations](https://www.imdb.com/name/nm0000243/awards?ref_=nm_awd)

## 🎯 Objectives

**Build a REST and GRAPHQL API to get the must-watch Denzel's movies**.

## 👩‍💻 Just tell me what to do

1. Fork the project via `github`

![fork](./img/fork.png)

1. Clone your forked repository project `https://github.com/YOUR_USERNAME/denzel`

```sh
❯ cd /path/to/workspace
❯ git clone git@github.com:YOUR_USERNAME/denzel.git
```

2. **[Do things](https://github.com/92bondstreet/denzel#%EF%B8%8F-steps-to-do)**

3. Commit your different modifications:

```sh
❯ cd /path/to/workspace/denzel
❯ git add -A && git commit -m "feat(movies): get a random movie"
❯ git push origin master
```

([why following a commit message convention?](https://www.conventionalcommits.org))

4. Don't forget to commit early, commit often and push often

```sh
❯ git push origin master
```

**Note**:

- If you catch an error about authentication, [add your ssh to your github profile](https://help.github.com/articles/connecting-to-github-with-ssh/).
- If you need some helps on git commands, read [git - the simple guide](http://rogerdudler.github.io/git-guide/)

## Definition and Configuration

### Definition

- A **must-watch** movie is a movie with a `metascore` higher than `70`.
- API should listen locally the port `9292`.
- Data should be stored in MongoDB. Backed either with a DaaS: [mLab](https://mlab.com), [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) etc... Either with a [container Docker](https://hub.docker.com/r/mvertes/alpine-mongo).
- To test and check your API, you should use a client like [Insomnia](https://insomnia.rest) or [Postman](https://www.getpostman.com/products)
- Deploy the API with a serverless cloud service: [Netlify](https://www.netlify.com), [Now](https://zeit.co/now) etc...

### Suggested node modules

- [axios](https://www.npmjs.com/package/axios) - Promise based HTTP client for the browser and node.js
- [cheerio](https://www.npmjs.com/package/cheerio) - Fast, flexible & lean implementation of core jQuery designed specifically for the server
- [dotenv](https://www.npmjs.com/package/dotenv) - Loads environment variables from .env for nodejs projects
- [express](https://www.npmjs.com/package/express) - Fast, unopinionated, minimalist web framework for node
- [graphql](https://www.npmjs.com/package/graphql) - A reference implementation of GraphQL for JavaScript
- [graphql-tools](https://www.npmjs.com/package/graphql-tools) - Build, mock, and stitch a GraphQL schema using the schema language
- [mongodb](https://www.npmjs.com/package/mongodb) - Mongo DB Native NodeJS Driver
- [nodemon](https://www.npmjs.com/package/nodemon) - Monitor for any changes in your node.js application and automatically restart the server - perfect for development

### Bootstrap the [server](./server/index.js)

```sh
❯ cd server
❯ npm i # or yarn
❯ node_modules/.bin/nodemon index.js
```

## 🏃‍♀️ Steps to do

### REST endpoints to implement

#### `GET /movies/populate/:id`

Populate the database with all the [Denzel's movies from IMDb](https://www.imdb.com/name/nm0000243).

You could use the [server/imdb.js](./server/imdb.js) ready-to-use exported function.

```sh
❯ curl -H "Accept: application/json" http://localhost:9292/movies/populate/nm0000243
{
  "total": 58
}
```

![populate](./img/populate.png)

Start [node server/sandbox.js](./server/sandbox.js) for an usage example.

```sh
❯ node server/sandbox.js
📽️  fetching filmography of nm0000243...
🍿 58 movies found.
[
  {
    "link": "https://www.imdb.com/title/tt3766354/?ref_=nm_flmg_act_3",
    "id": "tt3766354",
    "metascore": 50,
    "poster": "https://m.media-amazon.com/images/M/MV5BMTU2OTYzODQyMF5BMl5BanBnXkFtZTgwNjU3Njk5NTM@._V1_UX182_CR0,0,182,268_AL_.jpg",
    "rating": 6.7,
    "synopsis": "Robert McCall serves an unflinching justice for the exploited and oppressed, but how far will he go when that is someone he loves?",
    "title": "Equalizer 2 (2018)",
    "votes": 114.311,
    "year": 2018
  },
  {
    "link": "https://www.imdb.com/title/tt6000478/?ref_=nm_flmg_act_4",
    "id": "tt6000478",
    "metascore": 58,
    "poster": "https://m.media-amazon.com/images/M/MV5BMjMyNjkxMTg2NV5BMl5BanBnXkFtZTgwNjkyNTk0MzI@._V1_UX182_CR0,0,182,268_AL_.jpg",
    "rating": 6.4,
    "synopsis": "Roman J. Israel, Esq., a driven, idealistic defense attorney, finds himself in a tumultuous series of events that lead to a crisis and the necessity for extreme action.",
    "title": "L'Affaire Roman J. (2017)",
    "votes": 27.668,
    "year": 2017
  },
  ...
]
```

#### `GET /movies`

Fetch a random **must-watch** movie.

```sh
❯ curl -H "Accept: application/json" http://localhost:9292/movies
{
  "link": "https://www.imdb.com/title/tt0765429/?ref_=nm_flmg_act_15",
  "id": "tt0765429",
  "metascore": 76,
  "poster": "https://m.media-amazon.com/images/M/MV5BMjFmZGI2YTEtYmJhMS00YTE5LWJjNjAtNDI5OGY5ZDhmNTRlXkEyXkFqcGdeQXVyODAwMTU1MTE@._V1_UX182_CR0,0,182,268_AL_.jpg",
  "rating": 7.8,
  "synopsis": "An outcast New York City cop is charged with bringing down Harlem drug lord Frank Lucas, whose real life inspired this partly biographical film.",
  "title": "American Gangster (2007)",
  "votes": 376.889,
  "year": 2007
}
```

![movies](./img/movies.png)


#### `GET /movies/:id`

Fetch a specific movie.

```sh
❯ curl -H "Accept: application/json" http://localhost:9292/movies/tt0477080
{
  "link": "https://www.imdb.com/title/tt0477080/?ref_=nm_flmg_act_11",
  "id": "tt0477080",
  "metascore": 69,
  "poster": "https://m.media-amazon.com/images/M/MV5BMjI4NDQwMDM0N15BMl5BanBnXkFtZTcwMzY1ODMwNA@@._V1_UX182_CR0,0,182,268_AL_.jpg",
  "rating": 6.8,
  "synopsis": "With an unmanned, half-mile-long freight train barreling toward a city, a veteran engineer and a young conductor race against the clock to prevent a catastrophe.",
  "title": "Unstoppable (2010)",
  "votes": 177.986,
  "year": 2010
}
```

#### `GET /movies/search`

Search for Denzel's movies.

This endpoint accepts the following optional query string parameters:

- `limit` - number of movies to return (default: 5)
- `metascore` - filter by metascore (default: 0)

The results array should be sorted by metascore in descending way.

```sh
❯ curl -H "Accept: application/json" http://localhost:9292/movies/search?limit=5&metascore=77
{
  "limit": 5,
  "total": 3,
  "results": [
  {
    "id": "tt2671706",
    "link": "https://www.imdb.com/title/tt2671706/?ref_=nm_flmg_act_3",
    "metascore": 79,
    "poster": "https://m.media-amazon.com/images/M/MV5BOTg0Nzc1NjA0MV5BMl5BanBnXkFtZTgwNTcyNDQ0MDI@._V1_UX182_CR0,0,182,268_AL_.jpg",
    "rating": 7.2,
    "synopsis": "A working-class African-American father tries to raise his family in the 1950s, while coming to terms with the events of his life.",
    "title": "Fences (2016)",
    "votes": 84.291,
    "year": 2016
  },
  {
    "id": "tt0115956",
    "link": "https://www.imdb.com/title/tt0115956/?ref_=nm_flmg_act_31",
    "metascore": 77,
    "poster": "https://m.media-amazon.com/images/M/MV5BODJlOTlkNzUtN2U2OC00NWUxLTg3MjgtNGVmZGU5ZTk0ZjM4XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_UX182_CR0,0,182,268_AL_.jpg",
    "rating": 6.6,
    "synopsis": "A U.S. Army officer, despondent about a deadly mistake he made, investigates a female chopper commander's worthiness for the Medal of Honor.",
    "title": "À l'épreuve du feu (1996)",
    "votes": 46.271,
    "year": 1996
  },
  {
    "id": "tt0112857",
    "link": "https://www.imdb.com/title/tt0112857/?ref_=nm_flmg_act_32",
    "metascore": 78,
    "poster": "https://m.media-amazon.com/images/M/MV5BNjI3NjFiNmMtMmQ1ZC00OTUwLWJlMWMtM2UxY2M2NDQ0OWJhXkEyXkFqcGdeQXVyNTI4MjkwNjA@._V1_UX182_CR0,0,182,268_AL_.jpg",
    "rating": 6.7,
    "synopsis": "An African-American man is hired to find a woman, and gets mixed up in a murderous political scandal.",
    "title": "Le diable en robe bleue (1995)",
    "votes": 15.686,
    "year": 1995
  }]
}
```

#### POST /movies/:id

Save a watched date and a review.

This endpoint accepts the following post parameters:

- `date` - the watched date
- `review` - the personal review

```sh
❯ curl -X POST -d '{"date": "2019-03-04", "review": "😍 🔥"}' -H "Content-Type: application/json" http://localhost:9292/movies/tt0328107
{
  "_id": "507f191e810c19729de860ea"
}
```

### GraphQL endpoints to implement

Same definitions as REST API with `/graphql` endpoint.

- Populate the database
- Fetch a random **must-watch** movie
- Fetch a specific movie
- Search for Denzel's movies
- Save a watched date and a review.

#### (A suggested) Schema

```
schema {
  query Query
}

type Query {
  movies: [Movie]
  movie: Movie
}

type Movie {
  link: String
  metascore: Int
  synopsis: String
  title: String
  year: Int
}
```

```sh
❯ curl -d '{"query": "movie {link metascore synopsis title year}"}' -H "Content-Type: application/json" http://localhost:9292/graphql
{
  "data": {
    "movie": {
      "link": "https://www.imdb.com/title/tt0174856/?ref_=nm_flmg_act_23",
      "metascore": 74,
      "synopsis": "The story of Rubin \"Hurricane\" Carter, a boxer wrongly imprisoned for murder, and the people who aided in his fight to prove his innocence.",
      "title": "Hurricane Carter (1999)",
      "year": 1999
    }
  }
}
```

### Bonus - The Client side

Build a client side web application.

The MVP definiton could be:

Each time, we open the web application or refresh the page, fetch a random **must-watch** movie and

- display the title
- display the synopsis
- display the cover
- display the metascore
- display the review
- allow to open the IMDb record

## 🛣️ Related course

- [Course 7 - API-ness](https://github.com/92bondstreet/javascript-empire#-course-7---api-ness)
- [Course 8 - Make the Web accessible](https://github.com/92bondstreet/javascript-empire#-course-8---make-the-web-accessible)

## Licence

[Uncopyrighted](http://zenhabits.net/uncopyright/)
