const queryDB = require("./queryDB");

const queryTypes = [
  {
    name: "queryDB",
    getData: (query, params, db) => queryDB(query, params, db),
  }
]

module.exports = {
  queryDB: function queryDB() {
    return queryTypes[0];
  }
}
