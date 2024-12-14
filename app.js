const express = require('express');
const query = require('./db/queries');

const app = express();
app.set('view engine', 'ejs');

app.get('/', (req, res) => { 
  res.render('index');
});

app.get('/movies', async (req, res) => {
  const movies = await query.getMovies();
  res.render('movies', { movies });
});

app.get('/directors', (req, res) => {
  res.render('directors');
});





app.listen(3000, () => {
  console.log('Server is running on port 3000');
  console.log('http://localhost:3000');
});
