const pool = require("./pool");

async function getMovies() {
  const movie = await pool.query(
    "SELECT * FROM movie JOIN movie_director ON movie.id=movie_director.movie_id JOIN director ON director.id=movie_director.director_id JOIN person ON person.id=director.person_id;"
  );
  return movie.rows;
}

async function getGenres() {
  const genre = await pool.query("SELECT * FROM genre;");
  return genre.rows;
}

async function getMovie(title) {
  const movie = await pool.query(
    "SELECT title, release_year, runtime, meta_score, imdb_score, revenue_in_dollar, overview, img_url, movie.id as id, string_agg(DISTINCT genre_id, ', ') as genre_names, string_agg(DISTINCT actor_id::VARCHAR, ',') as actor_ids, string_agg(DISTINCT first_name || ' ' || last_name, ', ') as actor_names, (SELECT CONCAT_WS(' ', first_name, last_name) FROM person as t WHERE t.id=director.person_id) as director_name FROM movie JOIN movie_director ON movie.id=movie_director.movie_id JOIN movie_actor ON movie_actor.movie_id=movie.id JOIN actor ON actor.id=movie_actor.actor_id JOIN director ON director.id=movie_director.director_id JOIN person as p ON p.id=actor.person_id JOIN gross ON gross.movie_id=movie.id JOIN movie_genre ON movie.id=movie_genre.movie_id JOIN genre ON genre.name=movie_genre.genre_id WHERE title = $1 GROUP BY title, release_year, runtime, meta_score, imdb_score, revenue_in_dollar, overview, img_url, movie.id, director.person_id;",
    [title]
  );
  return movie.rows;
}

async function getMoviesByGenre(name) {
  const movie = await pool.query(
    "SELECT * FROM movie JOIN movie_genre ON movie.id=movie_genre.movie_id JOIN genre ON genre.name=movie_genre.genre_id JOIN movie_director ON movie.id=movie_director.movie_id JOIN director ON director.id=movie_director.director_id JOIN person ON person.id=director.person_id WHERE genre.name = $1;",
    [name]
  );
  return movie.rows;
}

async function getMovieById(id) {
  const movie = await pool.query(
    "SELECT title, release_year, runtime, meta_score, imdb_score, revenue_in_dollar, overview, img_url, movie.id as id, string_agg(DISTINCT genre_id, ', ') as genre_names, string_agg(DISTINCT actor_id::VARCHAR, ',') as actor_ids, string_agg(DISTINCT first_name || ' ' || last_name, ', ') as actor_names, (SELECT CONCAT_WS(' ', first_name, last_name) FROM person as t WHERE t.id=director.person_id) as director_name FROM movie JOIN movie_director ON movie.id=movie_director.movie_id JOIN movie_actor ON movie_actor.movie_id=movie.id JOIN actor ON actor.id=movie_actor.actor_id JOIN director ON director.id=movie_director.director_id JOIN person as p ON p.id=actor.person_id JOIN gross ON gross.movie_id=movie.id JOIN movie_genre ON movie.id=movie_genre.movie_id JOIN genre ON genre.name=movie_genre.genre_id WHERE movie.id = $1 GROUP BY title, release_year, runtime, meta_score, imdb_score, revenue_in_dollar, overview, img_url, movie.id, director.person_id;",
    [id]
  );
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
  const result = await pool.query(
    "DELETE FROM movie WHERE title = $1 RETURNING *;",
    [title]
  );
  return result.rows;
}

async function updateMovie(
  title,
  release_year,
  runtime,
  meta_score,
  imdb_score,
  overview,
  first_name,
  last_name,
  revenue_in_dollar
) {
  const result = await pool.query(
    "UPDATE movie SET release_year = $2, runtime = $3, meta_score = $4, imdb_score = $5, overview = $6  WHERE title = $1 RETURNING *;",
    [title, release_year, runtime, meta_score, imdb_score, overview]
  );
  // const result2 = await pool.query(
  //   "UPDATE movie_director SET release_year = $2, first_name = $3, last_name = $4, runtime = $5, meta_score = $6, imdb_score = $7, revenue_in_dollar = $8, overview = $9  WHERE title = $1 RETURNING *;",
  //   [first_name, last_name, revenue_in_dollar]
  // )
  return result.rows;
}

async function deleteGenre(name) {
  const result = await pool.query(
    "DELETE FROM genre WHERE name = $1 RETURNING *;",
    [name]
  );
  return result.rows;
}

module.exports = {
  getMovies,
  insertMovie,
  deleteMovie,
  updateMovie,
  getMovie,
  getMovieById,
  getGenres,
  getMoviesByGenre,
  deleteGenre
};
