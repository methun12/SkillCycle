`backend/src/db/connection.js`


const mysql = require('mysql2/promise');

// Import and configure dotenv to load environment variables from the .env file
// into process.env. This must be done before process.env variables are used.
require('dotenv').config();

/**
 * Creates a MySQL connection pool.
 * A connection pool is a cache of database connections maintained so that the
 * connections can be reused when future requests to the database are required.
 * This improves performance and scalability by avoiding the overhead of establishing
 * a new connection for every request.
 */
const pool = mysql.createPool({
  // The hostname of the database you are connecting to.
  host: process.env.DB_HOST,

  // The MySQL user to authenticate as.
  user: process.env.DB_USER,

  // The password of that MySQL user.
  password: process.env.DB_PASSWORD,

  // Name of the MySQL database to use.
  database: process.env.DB_NAME,

  // Determines the action to take when no connections are available in the pool.
  // If `true`, the request will be queued and executed when a connection becomes available.
  // If `false`, the pool will immediately return an error. `true` is recommended for web apps.
  waitForConnections: true,

  // The maximum number of connections to create at once.
  // This prevents your application from overwhelming the database server.
  connectionLimit: 10,

  // The maximum number of connection requests the pool will queue before returning an error.
  // A value of `0` means there is no limit to the number of queued requests.
  queueLimit: 0,
});

// A simple log to confirm that the connection pool has been created on server start.
// This is very useful for debugging initial setup issues.
console.log('✅ Database connection pool created successfully.');


// to execute database queries.
module.exports = pool;