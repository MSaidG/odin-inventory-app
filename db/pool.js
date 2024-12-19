const { Pool } = require('pg');

// const pool = new Pool({
//   user: process.env.DB_USER || 'postgres',
//   host: process.env.DB_HOST || 'localhost',
//   database: process.env.DB_NAME || 'postgres',
//   password: process.env.DB_PASSWORD || 'postgres',
//   port: process.env.DB_PORT || 5432,
// });

const pool = new Pool({
  connectionString: process.env.MOVIE_DB_URI,
})

module.exports = pool;