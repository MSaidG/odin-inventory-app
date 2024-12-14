const pool = require("./pool");

async function getMovies() {
  const movie = await pool.query("SELECT * FROM movie JOIN movie_director ON movie.id=movie_director.movie_id JOIN director ON director.id=movie_director.director_id JOIN person ON person.id=director.person_id;");
  console.log(movie.rows);
  return movie.rows;
}

async function insertMovie(title, release_year) {
  const result = await pool.query(
    "INSERT INTO movie (title, release_year) VALUES ($1, $2) RETURNING *;",
    [title, release_year]
  );
  return result.rows;
}

async function deleteMovie(title) {
  const result = await pool.query("DELETE FROM movie WHERE title = $1;", [id]);
  return result.rows;
}


async function updateMovie(title, release_year) {
  const result = await pool.query(
    "UPDATE movie SET release_year = $1 WHERE title = $2 RETURNING *;",
    [title, release_year]
  );
  return result.rows;
}


module.exports = { getMovies, insertMovie, deleteMovie, updateMovie }; 