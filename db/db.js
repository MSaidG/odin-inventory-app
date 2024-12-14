const { pool } = require("./pool");

person_first_names = [];
person_last_names = [];
genre_names = [];

async function insertMovies(
  title,
  release_year,
  certificate,
  overview,
  runtime,
  img_url,
  gross,
  firstNameDirector,
  lastNameDirector,
  genres,
  imdb_score,
  meta_score,
  casts
) {
  const grossRegion = "US&Canada";
  try {
    const movie = await pool.query(
      "INSERT INTO movie (title, release_year, certificate, overview, runtime, img_url, imdb_score, meta_score) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        title,
        release_year,
        certificate,
        overview,
        runtime,
        img_url,
        imdb_score,
        meta_score,
      ]
    );
    const movie_id = movie.rows[0].id;

    // MOVIE

    await pool.query(
      "INSERT INTO gross (region, revenue_in_dollar, movie_id) VALUES ($1, $2, $3) RETURNING *",
      [grossRegion, gross, movie_id]
    );

    // PERSON

    let person = {};
    let person_id = 2;
    if (
      !person_first_names.includes(firstNameDirector) &&
      !person_last_names.includes(lastNameDirector)
    ) {
      person_first_names.push(firstNameDirector);
      person_last_names.push(lastNameDirector);
      person = await pool
        .query(
          "INSERT INTO person (first_name, last_name) VALUES ($1, $2) RETURNING *",
          [firstNameDirector, lastNameDirector]
        )
        .then((res) => {
          person_id = res.rows[0].id;
          console.log("1:  " + firstNameDirector, lastNameDirector);
        })
        .catch((err) => {
          console.log("2:  " + err.message);
        });
    } else {
      person = await pool
        .query(
          "SELECT first_name, last_name FROM person WHERE first_name = $1 AND last_name = $2",
          [firstNameDirector, lastNameDirector]
        )
        .then((res) => {
          person_id = res.rows[0].id;
          console.log("3:  " + firstNameDirector, lastNameDirector);
        })
        .catch((err) => {
          console.log("4:  " + err.message);
        });
    }

    // DIRECTOR

    let director_id = 3;
    await pool
      .query("INSERT INTO director (person_id) VALUES ($1) RETURNING *", [
        person_id,
      ])
      .then((res) => {
        director_id = res.rows[0].id;
      })
      .catch((err) => {
        console.log("5:  " + err.message);
      });

    await pool.query(
      "INSERT INTO movie_director (movie_id, director_id) VALUES ($1, $2) RETURNING *",
      [movie_id, director_id]
    );

    // GENRES

    await genres.forEach(async (name) => {
      if (!genre_names.includes(name)) {
        genre_names.push(name);
        await pool
          .query("INSERT INTO genre (name) VALUES ($1)", [name])
          .catch((err) => {
            console.log("9:  " + movie_id, title, name);
            console.log("10:  " + err.message);
          });
      }

      await pool
        .query("INSERT INTO movie_genre (movie_id, genre_id) VALUES ($1, $2)", [
          movie_id,
          name,
        ])
        .catch((err) => {
          console.log("7:  " + movie_id, title, name);
          console.log("8:  " + err.message);
        });
    });

    await console.log("6:  ", title);

    // CAST

    casts.forEach(async (cast) => {
      person = {};
      // person_id = 2;
      if (
        !person_first_names.includes(cast.first) &&
        !person_last_names.includes(cast.last)
      ) {
        person_first_names.push(cast.first);
        person_last_names.push(cast.last);
        person = await pool
          .query(
            "INSERT INTO person (first_name, last_name) VALUES ($1, $2) RETURNING *",
            [cast.first, cast.last]
          )
          .then((res) => {
            person_id = res.rows[0].id;
            console.log("11:  " + cast.first, cast.last);
          })
          .catch((err) => {
            console.log("12:  " + err.message);
          });
      } else {
        person = await pool
          .query(
            "SELECT first_name, last_name FROM person WHERE first_name = $1 AND last_name = $2",
            [cast.first, cast.last]
          )
          .then((res) => {
            person_id = res.rows[0].id;
            console.log("13:  " + cast.first, cast.last);
          })
          .catch((err) => {
            console.log("14:  " + err.message);
          });
      }

      // DIRECTOR

      let cast_id = 0;
      await pool
        .query(`INSERT INTO "cast" (person_id) VALUES ($1) RETURNING *`, [
          person_id,
        ])
        .then(async (res) => {
          cast_id = res.rows[0].id;
          await pool.query(
            "INSERT INTO movie_cast (movie_id, cast_id) VALUES ($1, $2) RETURNING *",
            [movie_id, cast_id]
          );
        });
    });
  } catch (err) {
    console.log("9:  " + err.message);
  }

  await genres.forEach(async (name) => {});
}

async function truncate() {
  try {
    const res = await pool
      .query(
        "TRUNCATE TABLE movie, gross, movie_director, director, person, genre, movie_genre CASCADE"
      )
      .then((res) => {
        // console.log("1:  " + res.rows);
      });
  } catch (err) {
    console.error(err);
  }
}

// main();

module.exports = { insertMovies, truncate };
