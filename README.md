# Blockchain interaction

Give me the details, how is it done?

**Option 1: DeFi example**

Step 1: Write .sol file in VS

Create an empty hardhat setup. Create .sol file in it and grant it access to your private key and RPC provider (Infura, Quicknode, …) - both via .env file that you will not allow to be in your .git tracking list (list in .gitnore file). Make sure you have adjusted your deployer script and adjusted your hardhat.config.js file

```jsx
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.7.6",
  networks: {
    goerli: {
      url: process.env.INFURA_URL_GOERLI,
      accounts: [process.env.WALLET_SECRET]
    }
  }
};
```

Step 2: Compile and deploy .sol file (= your contract)
*npx hardhat run --network goerli scripts/deploySingleSwap.js*

(write down the contract address)

Step 3: Open remix, copy paste the code of your deployed contract into the default folder. 
Then  pick the correct compiler

![Screenshot 2023-03-26 at 17.21.48.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/c81f0f01-019a-4c67-aaa9-c48f2903f57a/Screenshot_2023-03-26_at_17.21.48.png)

Pick the correct Environment, in our case the Injected Privder (Matamask) and instead off deploying, copy the deployed address in the “Ad Address” field.›

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/948c45b4-0937-4654-8343-1b9ccdcc7e03/Untitled.png)

The fields of the contract appear. You can now interacts and (as in our example) swap back and forth.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/6baaed32-cd3a-4d63-b64f-53dfb868d05d/Untitled.png)

**Success**:
