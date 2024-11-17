const express = require("express");
const router = express.Router();
const ethers = require("ethers");
const queryTypes = require("../../util/queryTypes");
const queryDB = queryTypes.queryDB();

router.post("/", async function (req, res, next) {
  try {
    let data = req.body;
    let account = data.account;
    let blockchain = data.blockchain;
    let application_id = data.application_id;
    let query;
    let params;
    let db = "faucet_db";

    if (
      !account ||
      account === "" ||
      !ethers.utils.isAddress(account)
    ) {
      console.log(`Register request without valid account.`);
      res.status(400).json({
        success: false,
        msg: "Valid public address not provided.",
      });
      return;
    }

    query = `select * from user_header where account = ? and blockchain = ?`;
    params = [account, blockchain];
    user_record = await queryDB
      .getData(query, params, db)
      .then((results) => {
        return results;
      })
      .catch((error) => {
        console.error("Error retrieving data:", error);
      });

    if (user_record == "") {
      query = "INSERT INTO user_header (account, nonce, funded, blockchain, application_id) VALUES (?, ?, ?, ?, ?)";
      nonce = Math.floor(Math.random() * 1000000);
      await queryDB
        .getData(query, [account, nonce, 0, blockchain, application_id, 0])
        .then((results) => {
          return results;
        })
        .catch((error) => {
          console.error("Error retrieving data:", error);
        });

      query = `select * from user_header where account = ?`;
      params = [account];
      user_record = await queryDB
        .getData(query, params, db)
        .then((results) => {
          return results;
        })
        .catch((error) => {
          console.error("Error retrieving data:", error);
        });
    }

    res.status(200).json({
      success: true,
      user_record: user_record,
      msg: ``,
    });
    return;
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      msg: `Oops, something went wrong! Please try again later.`,
    });
  }
});

module.exports = router;
