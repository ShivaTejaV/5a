const express = require("express");
let app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const filepath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: filepath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(error);
  }
};

initializeDBAndServer();

let convertJsonObjectToCamelCase = (obj) => {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  };
};

//API1

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT *
    FROM movie;
    `;
  let dbResponse = await db.all(getMoviesQuery);
  console.log(dbResponse);
  let response2 = [];
  for (let ele of dbResponse) {
    response2.push({ movieName: convertJsonObjectToCamelCase(ele).movieName });
  }
  response.send(response2);
});

//API2

app.post("/movies/", async (request, response) => {
  try {
    const getLastId = `
    SELECT movie_id
    FROM movie
    ORDER BY movie_id DESC
    LIMIT 1;`;
    const lastId = await db.get(getLastId);
    const id = lastId.movie_id + 1;
    const details = request.body;
    let { directorId, movieName, leadActor } = request.body;
    console.log(id, leadActor, movieName, leadActor);

    const addMovieQuery = `
  INSERT INTO movie(movie_id,director_id,movie_name,lead_actor)
  VALUES(
        ${id},
        ${directorId},
        "${movieName}",
        "${leadActor}"
    );`;
    await db.run(addMovieQuery);
    response.send("Movie Successfully Added");
  } catch (error) {
    console.log(error);
  }
});

//API3

app.get("/movies/:movieId/", async (request, response) => {
  try {
    const { movieId } = request.params;
    const id = parseInt(movieId);
    const getMovieQuery = `
        SELECT *
        FROM movie
        WHERE 
        movie_id = ${id};`;
    let dbResponse = await db.get(getMovieQuery);
    response.send(convertJsonObjectToCamelCase(dbResponse));
  } catch (error) {
    console.log(error);
  }
});

//API4

app.put("/movies/:movieId/", async (request, response) => {
  try {
    const { movieId } = request.params;
    const id = parseInt(movieId);
    const { directorId, movieName, leadActor } = request.body;
    console.log(directorId, movieName, leadActor);
    const editMovieDetailsQuery = `
        UPDATE
            movie
        SET
            director_id =${directorId},
            movie_name = "${movieName}",
            lead_actor = "${directorId}"
        WHERE
            movie_id=${id};
        `;
    let ans = await db.run(editMovieDetailsQuery);
    response.send("Movie Details Updated");
  } catch (error) {
    console.log(error);
  }
});

//API5

app.delete("/movies/:movieId/", async (request, response) => {
  try {
    let { movieId } = request.params;
    movieId = parseInt(movieId);
    //console.log(movieId);
    const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};`;
    await db.run(deleteMovieQuery);
    response.send("Movie Removed");
  } catch (error) {
    console.log(error);
  }
});

//API6

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
        SELECT *
        FROM director;`;
  let dbResponse = await db.all(getDirectorsQuery);
  let ans = [];
  //console.log(dbResponse);

  for (let ele of dbResponse) {
    let temp = {
      directorId: ele.director_id,
      directorName: ele.director_name,
    };
    ans.push(temp);
  }
  response.send(ans);
});

// API 7

app.get("/directors/:directorId/movies", async (request, response) => {
  const { directorId } = request.params;
  console.log(directorId);
  const id = parseInt(directorId);
  const query = `
    SELECT movie_name
    FROM 
        director LEFT JOIN movie ON director.director_id = movie.director_id
    WHERE director.director_id = ${id};`;
  let dbResponse = await db.all(query);
  let ans = [];
  for (let movie of dbResponse) {
    ans.push({ movieName: movie.movie_name });
  }
  response.send(ans);
});

module.exports = app;
