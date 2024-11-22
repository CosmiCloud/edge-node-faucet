# Edge Node Faucet

A simple EVM faucet with web3 JWT authentication.

## DISCLAIMER

Using this repository implies understanding that this faucet will result in funds being dispersed to requestors. Operators are responsible for the wallet credentials configured in the faucet.

### Prerequisite

- Install mysql
- CREATE DATABASE faucet_db;
- CREATE TABLE faucet_db.user_header (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account VARCHAR(42) NOT NULL,
  nonce INT NOT NULL,
  funded BOOLEAN DEFAULT FALSE,
  blockchain INT NOT NULL,
  application_id VARCHAR(20) NOT NULL
  );

### Install Instructions

- Clone repo
- npm install
- Copy config/example_faucet_config.json to faucet_config.json
- nano config/faucet_config.json
- npm start

### How To Use

- See test.js for example
