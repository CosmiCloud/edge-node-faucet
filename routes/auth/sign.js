const fs = require("fs");
const path = require("path");
const configPath = path.resolve(__dirname, "../../config/faucet_config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const express = require("express");
const router = express.Router();
const ethers = require("ethers");
const ethUtil = require("ethereumjs-util");
const jwt = require("jsonwebtoken");
const queryTypes = require("../../util/queryTypes");
const queryDB = queryTypes.queryDB();

router.post("/", async function (req, res, next) {
  try {
    let data = req.body;
    let account = data.account;
    let signature = data.signature;
    let application_id = data.application_id;
    let query;
    let params;
    let db = "faucet_db";

    if (!account || account === "" || !ethers.utils.isAddress(account)) {
      console.log(`Register request without valid account.`);
      res.status(400).json({
        success: false,
        msg: "Valid account not provided.",
      });
      return;
    }

    if (!signature || signature === "") {
      console.log(`Sign request without valid signature.`);
      res.status(400).json({
        success: false,
        msg: "Valid signature not provided.",
      });
      return;
    }

    query = `select * from user_header where account = ? and application_id = ?`;
    params = [account, application_id];
    user_record = await queryDB
      .getData(query, params, db)
      .then((results) => {
        return results;
      })
      .catch((error) => {
        console.error("Error retrieving data:", error);
      });

      console.log(user_record)
    if (user_record && user_record[0].application_id !== application_id) {
      throw new Error(
        "App key provided does not match app key registered to account."
      );
    }

    // Get user from db
    if (user_record) {
      const msg = `Please sign nonce ${user_record[0].nonce} to authenticate account ownership.`;
      // Convert msg to hex string
      const msgHex = ethUtil.bufferToHex(Buffer.from(msg));

      // Check if signature is valid
      const msgBuffer = ethUtil.toBuffer(msgHex);
      const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
      const signatureBuffer = ethUtil.toBuffer(signature);
      const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
      const publicKey = ethUtil.ecrecover(
        msgHash,
        signatureParams.v,
        signatureParams.r,
        signatureParams.s
      );
      const addressBuffer = ethUtil.publicToAddress(publicKey);
      const address = ethUtil.bufferToHex(addressBuffer);

      // Check if address matches
      if (address.toLowerCase() === account.toLowerCase()) {
        // Change user nonce
        query = `UPDATE user_header SET nonce = ? where account = ? and application_id = ?`;
        params = [Math.floor(Math.random() * 1000000), account, application_id];
        await queryDB
          .getData(query, params, db)
          .then((results) => {
            return results;
          })
          .catch((error) => {
            console.error("Error retrieving data:", error);
          });
        // Set jwt token
        const token = jwt.sign(
          {
            _id: account,
            address: account,
          },
          config.jwt_secret,
          { expiresIn: config.jwt_expire }
        );

        res.status(200).json({
          success: true,
          token: `Bearer ${token}`,
          user_record: user_record,
          msg: "Successfully Authenticated.",
        });
      } else {
        // User is not authenticated
        console.log(`Sign request without valid signature or app key.`);
        res.status(400).json({
          success: false,
          msg: "Valid signature not provided.",
        });
        return;
      }
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      msg: `Oops, something went wrong! Please try again later.`,
    });
  }
});

module.exports = router;
