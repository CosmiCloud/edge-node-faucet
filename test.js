const fs = require("fs");
const path = require("path");
const ethers = require("ethers");
const axios = require("axios");
const configFile = path.join(__dirname, "config/faucet_config.json");
const faucet_config = JSON.parse(fs.readFileSync(configFile, "utf8"));
const faucet_endpoint = faucet_config.faucet_endpoint;
const keyPair = {address: "0x", privatekey: ""}
const application_id = "" //up to 20 characters
const blockchain = "" // ex. 84532

const handleSignMessage = async (nonce, privateKey) => {
    try {
      const wallet = new ethers.Wallet(privateKey);
      const message = `Please sign nonce ${nonce} to authenticate account ownership.`;
      const signature = await wallet.signMessage(message);
  
      return signature;
    } catch (e) {
      console.error("Failed to sign message:", e);
      throw e;
    }
  };
  
  const fundWallet = async (keyPair, application_id) => {
    try {
      logMessage(`Registering for faucet funding...`);
      const register_response = await axios.post(
        `${faucet_endpoint}/auth/register`,
        { account: keyPair.address, application_id: application_id, blockchain: blockchain }
      );
  
      logMessage(`Signing message...`);
      const signedMessage = await handleSignMessage(
        register_response.data.user_record[0].nonce,
        keyPair.privateKey
      );
  
      logMessage(`Authenticating wallet ownership...`);
      const signature_response = await axios.post(
        `${faucet_endpoint}/auth/sign`,
        { account: keyPair.address, signature: signedMessage, application_id: application_id }
      );
  
      let faucet_token = signature_response.data.token;
  
      logMessage(`Sending funding request...`);
      await axios.post(
        `${faucet_endpoint}/faucet/fund-wallet`,
        {
          public_key: keyPair.address,
          blockchain: blockchain,
          application_id: application_id,
        },
        {
          headers: {
            Authorization: faucet_token,
          },
        }
      );
  
      logMessage(`Wallet funded.`);
    } catch (e) {
      console.error("Failed to sign message:", e);
      throw e;
    }
  };

  fundWallet(keyPair, application_id, blockchain)