const fs = require("fs");
const path = require("path");
const configPath = path.resolve(__dirname, "../../config/faucet_config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const express = require("express");
const router = express.Router();
const web3passport = require("../../util/auth/passport");
const queryTypes = require("../../util/queryTypes");
const queryDB = queryTypes.queryDB();
const { ethers } = require("ethers");
const db = "faucet_db";

router.post(
  "/",
  web3passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    try {
      let account = req.user[0].account;
      let blockchain = req.body.blockchain;
      let application_id = req.body.application_id;
      let rpc;

      switch (blockchain) {
        case "base:8453":
          rpc = config.base_mainnet_faucet_rpc;
          break;
        case "gnosis:100":
          rpc = config.gnosis_mainnet_faucet_rpc;
          break;
        case "otp:2043":
          rpc = config.neuroweb_mainnet_faucet_rpc;
          break;
        default:
          if (blockchain.startsWith("base")) {
            rpc = config.base_testnet_faucet_rpc;
          } else if (blockchain.startsWith("gnosis")) {
            rpc = config.gnosis_testnet_faucet_rpc;
          } else if (blockchain.startsWith("otp")) {
            rpc = config.neuroweb_testnet_faucet_rpc;
          } else {
            rpc = undefined;
          }
          break;
      }

      console.log(`Fund request received from ${account}...`);

      let query = `SELECT * FROM user_header WHERE account = ? AND funded = 0 AND blockchain = ? AND application_id = ?`;
      let params = [account, blockchain, application_id];
      let result = await queryDB
        .getData(query, params, db)
        .then((results) => {
          return results;
        })
        .catch((error) => {
          console.error("Error retrieving data:", error);
        });

      if (result.length === 0) {
        throw new Error("No wallet found that still needs funded.");
      }

      const provider = new ethers.providers.JsonRpcProvider(rpc);
      const wallet = new ethers.Wallet(config.faucet_private_key, provider);
      const gasPrice = await provider.getGasPrice();
      const gas = ethers.utils.formatUnits(gasPrice, "gwei");

      const tx = {
        to: account,
        value: ethers.utils.parseEther(config.faucet_amount),
        gasPrice: ethers.utils.parseUnits(gas, "gwei"),
      };

      const transaction = await wallet.sendTransaction(tx);
      await transaction.wait();

      query = `UPDATE user_header set funded = 1 WHERE account = ? AND blockchain = ? AND application_id = ?`;
      await queryDB
        .getData(query, params, db)
        .then((results) => {
          //console.log('Query results:', results);
          return results;
          // Use the results in your variable or perform further operations
        })
        .catch((error) => {
          console.error("Error retrieving data:", error);
        });

      console.log("Wallet funded.");
      res.status(200).json({
        success: true,
        result: [],
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({
        success: false,
        msg: `Oops, something went wrong! Please try again later.`,
      });
    }
  }
);

module.exports = router;
