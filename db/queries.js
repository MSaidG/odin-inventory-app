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
    "SELECT title, release_year, runtime, meta_score, imdb_score, revenue_in_dollar, overview, img_url, movie.id as id, string_agg(DISTINCT genre_id, ', ') as genre_names, string_agg(DISTINCT first_name || ' ' || last_name, ', ') as actor_names, (SELECT CONCAT_WS(' ', first_name, last_name) FROM person as t WHERE t.id=director.person_id) as director_name FROM movie JOIN movie_director ON movie.id=movie_director.movie_id JOIN movie_actor ON movie_actor.movie_id=movie.id JOIN actor ON actor.id=movie_actor.actor_id JOIN director ON director.id=movie_director.director_id JOIN person as p ON p.id=actor.person_id JOIN gross ON gross.movie_id=movie.id JOIN movie_genre ON movie.id=movie_genre.movie_id JOIN genre ON genre.name=movie_genre.genre_id WHERE title = $1 GROUP BY title, release_year, runtime, meta_score, imdb_score, revenue_in_dollar, overview, img_url, movie.id, director.person_id;",
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
    "SELECT title, release_year, runtime, meta_score, imdb_score, revenue_in_dollar, overview, img_url, movie.id as id, string_agg(DISTINCT genre_id, ', ') as genre_names, string_agg(DISTINCT first_name || ' ' || last_name, ', ') as actor_names, (SELECT CONCAT_WS(' ', first_name, last_name) FROM person as t WHERE t.id=director.person_id) as director_name FROM movie JOIN movie_director ON movie.id=movie_director.movie_id JOIN movie_actor ON movie_actor.movie_id=movie.id JOIN actor ON actor.id=movie_actor.actor_id JOIN director ON director.id=movie_director.director_id JOIN person as p ON p.id=actor.person_id JOIN gross ON gross.movie_id=movie.id JOIN movie_genre ON movie.id=movie_genre.movie_id JOIN genre ON genre.name=movie_genre.genre_id WHERE movie.id = $1 GROUP BY title, release_year, runtime, meta_score, imdb_score, revenue_in_dollar, overview, img_url, movie.id, director.person_id;",
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
  director_first_name,
  director_last_name,
  revenue_in_dollar,
  genres,
  actors
) {
  // UDPATE MOVIE
  const result = await pool.query(
    "UPDATE movie SET release_year = $2, runtime = $3, meta_score = $4, imdb_score = $5, overview = $6  WHERE title = $1 RETURNING *;",
    [title, release_year, runtime, meta_score, imdb_score, overview]
  );

  // UPDATE DIRECTOR
  await pool.query(
    "DELETE FROM movie_director WHERE movie_id = $1 RETURNING *;",
    [result.rows[0].id]
  );

  const personDirector = await pool.query(
    "SELECT * FROM person WHERE first_name = $1 AND last_name = $2;",
    [director_first_name, director_last_name]
  );

  if (personDirector.rows.length === 0) {
    const directorPerson = await pool.query(
      "INSERT INTO person (first_name, last_name) VALUES ($1, $2) RETURNING *;",
      [director_first_name, director_last_name]
    );
    const director = await pool.query(
      "INSERT INTO director (person_id) VALUES ($1) RETURNING *;",
      [directorPerson.rows[0].id]
    );
    await pool.query(
      "INSERT INTO movie_director (movie_id, director_id) VALUES ($1, $2) RETURNING *;",
      [result.rows[0].id, director.rows[0].id]
    );
  } else {
    const director = await pool.query(
      "SELECT id FROM director WHERE person_id = $1;",
      [personDirector.rows[0].id]
    );
    await pool.query(
      "INSERT INTO movie_director (movie_id, director_id) VALUES ($1, $2) RETURNING *;",
      [result.rows[0].id, director.rows[0].id]
    );
  }

  // UPDATE GROSS
  const result3 = await pool.query(
    "UPDATE gross SET revenue_in_dollar = $2 WHERE movie_id = $1 AND region = $3 RETURNING *;",
    [result.rows[0].id, revenue_in_dollar, "US&Canada"]
  );

  // UPDATE GENRES
  const result6 = await pool.query(
    "DELETE FROM movie_genre WHERE movie_id = $1 RETURNING *;",
    [result.rows[0].id]
  );

  genres.forEach(async (genre) => {
    const trimmedGenre = genre.trim().replace(/,/g, "");
    if (trimmedGenre.length === 0) return;

    const result7 = await pool.query("SELECT * FROM genre WHERE name = $1;", [
      trimmedGenre,
    ]);

    if (result7.rows.length === 0) {
      const result8 = await pool.query(
        "INSERT INTO genre (name) VALUES ($1) RETURNING *;",
        [trimmedGenre]
      );
    }

    const result9 = await pool.query(
      "INSERT INTO movie_genre (movie_id, genre_id) VALUES ($1, $2) RETURNING *;",
      [result.rows[0].id, trimmedGenre]
    );
  });

  // UPDATE ACTORS (CHECK IF IT IS CORRECT)
  const result5 = await pool.query(
    "DELETE FROM movie_actor WHERE movie_id = $1 RETURNING *;",
    [result.rows[0].id]
  );
  actors.forEach(async (actor) => {
    const trimmedActor = actor.trim().replace(/,/g, "");
    if (trimmedActor.length === 0) return;

    const actorFirstName = trimmedActor.split(" ").slice(0, -1).join(" ");
    const actorLastName = trimmedActor.split(" ").slice(-1).join(" ");

    const person = await pool.query(
      "SELECT * FROM person WHERE first_name = $1 AND last_name = $2;",
      [actorFirstName, actorLastName]
    );

    if (person.rows.length === 0) {
      const actorPerson = await pool.query(
        "INSERT INTO person (first_name, last_name) VALUES ($1, $2) RETURNING *;",
        [actorFirstName, actorLastName]
      );
      const actor = await pool.query(
        "INSERT INTO actor (person_id) VALUES ($1) RETURNING *;",
        [actorPerson.rows[0].id]
      );
      await pool.query(
        "INSERT INTO movie_actor (movie_id, actor_id) VALUES ($1, $2) RETURNING *;",
        [result.rows[0].id, actor.rows[0].id]
      );
    } else {
      const actor = await pool.query(
        "SELECT id FROM actor WHERE person_id = $1;",
        [person.rows[0].id]
      );
      await pool.query(
        "INSERT INTO movie_actor (movie_id, actor_id) VALUES ($1, $2) RETURNING *;",
        [result.rows[0].id, actor.rows[0].id]
      );
    }
  });
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
  deleteGenre,
};
