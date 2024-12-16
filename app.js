const express = require("express");
const query = require("./db/queries");

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index", { title: "Home Page" });
});

app.get("/movies", async (req, res) => {
  const movies = await query.getMovies();
  res.render("movies", { title: "Movies", movies });
});

app.delete("/movies/:title", async (req, res) => {
  const movie = await query.deleteMovie(req.params.title);
  res.redirect(204, "/movies");
});

app.get("/movies/update/:id", async (req, res) => {
  const movie = await query.getMovieById(req.params.id);
  console.log(movie);
  if (movie.length === 0) {
    return res.render("404");
  }
  res.render("update", { title: "Update Movie",movie: movie[0] });
});

app.put("/movies/update/:id", async (req, res) => {
  await query.updateMovie(
    req.body.title,
    req.body.release_year,
    req.body.runtime,
    req.body.meta_score,
    req.body.imdb_score,
    req.body.overview,
    req.body.first_name,
    req.body.last_name,
    req.body.revenue_in_dollar
  );
  res.redirect(`../${req.body.title}`);
});

app.get("/movies/:title", async (req, res) => {
  const movie = await query.getMovie(req.params.title);
  if (movie.length === 0) {
    return res.render("404");
  }
  res.render("movie", { title: "Movie Details", movie: movie[0] });
});

app.get("/directors", (req, res) => {
  res.render("directors", { title: "Directors" });
});

app.get("/genres", async (req, res) => {
  const genres = await query.getGenres();
  res.render("genres", { title: "Genres", genres });
})

app.get("/genres/:name", async (req, res) => {
  const movies = await query.getMoviesByGenre(req.params.name);
  res.render("genre", { title: `${req.params.name} Movies`, movies });
});

const PORT = process.env.PORT || 8000;
app.listen(8000, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
