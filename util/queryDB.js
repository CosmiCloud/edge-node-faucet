const faucet_db = require("../config/faucet_db.js");

module.exports = executeQuery = async (query, params) => {
  return new Promise(async (resolve, reject) => {
    let pool = faucet_db;

    // Get a connection from the pool
    pool.getConnection((err, connection) => {
      if (err) {
        return reject(err); // Handle connection error
      }

      // Perform the query using the connection
      connection.query(query, params, (error, results) => {
        // Release the connection back to the pool
        connection.release();

        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  });
};
