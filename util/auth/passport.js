const fs = require("fs");
const path = require("path");
const configPath = path.resolve(__dirname, "../../config/faucet_config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const queryTypes = require('../../util/queryTypes')
const queryDB = queryTypes.queryDB()

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.jwt_secret;

  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      let query = `select * from user_header where account = ?`
      let params = [jwt_payload._id]
      let user_record = await queryDB.getData(query, params, "faucet_db")
            .then(results => {
            return results
            })
            .catch(error => {
            console.error('Error retrieving data:', error)
            })

            if (user_record) return done(null, user_record);
            return done(null, false);
    })
  );

module.exports = passport;
