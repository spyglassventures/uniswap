
// Import the 'ethers' library
const { ethers } = require('ethers')
// NOT import { ethers } from 'ethers';

// Import the ABI (Application Binary Interface) of the 'IUniswapV3Pool' contract from the '@uniswap/v3-core' library
const { abi: IUniswapV3PoolABI } = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json')

// Import the ABI of the 'SwapRouter' contract from the '@uniswap/v3-periphery' library
const { abi: SwapRouterABI } = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json')

// Import helper functions from the './helpers' file located in the same directory
const { getPoolImmutables, getPoolState } = require('./helpers')

// Import the ABI of an ERC20 contract from a JSON file located in the same directory
const ERC20ABI = require('./abi.json')

require('dotenv').config()
const INFURA_URL_ARBITRUM = process.env.INFURA_URL_ARBITRUM
const WALLET_ADDRESS = process.env.WALLET_ADDRESS
const WALLET_SECRET = process.env.WALLET_SECRET

// src: https://www.geckoterminal.com/de/arbitrum/pools/0xc31e54c7a869b9fcbecc14363cf510d1c41fa443
const poolAddress = "0xc31e54c7a869b9fcbecc14363cf510d1c41fa443" // WETH/USDC Pool w/ Uniswap (Arbitrum) 
// src: https://docs.uniswap.org/contracts/v3/reference/deployments, same for Mainnet and Testnet
const SwapRouterAddress = '0xE592427A0AEce92De3Edee1F18E0157C05861564'

const name0 = 'Wrapped Ether'
const symbol0 = 'WETH'
const decimals0 = 18
// src: https://www.geckoterminal.com/de/arbitrum/pools/0xc31e54c7a869b9fcbecc14363cf510d1c41fa443
const address0 = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'

const name1 = 'USDC'
const symbol1 = 'USDC'
const decimals1 = 18
// src: https://www.geckoterminal.com/de/arbitrum/pools/0xc31e54c7a869b9fcbecc14363cf510d1c41fa443
const address1 = '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'


console.log(`\nImported Network Url: ${INFURA_URL_ARBITRUM}.\n`);
console.log(`Imported Wallet Address: ${WALLET_ADDRESS}.\n`);
console.log(`Imported Pool Adress: ${poolAddress}.\n`);
console.log(`Imported Swap Router Adress: ${SwapRouterAddress}.\n`);
console.log(`Imported Token 0: ${name0}.\n`);
console.log(`Imported Token 1: ${name1}.\n`);
console.log(`ethers version: ${ethers.version}\n`);

// the code alternative to Web3 provider
const provider = new ethers.providers.JsonRpcProvider(INFURA_URL_ARBITRUM); // Arbitrum

// see if we are connected via RPC
async function checkConnection() {
    try {
      const network = await provider.getNetwork();
      console.log(`Connected to network: ${network.name} (chain ID: ${network.chainId})`);
      // continue with other code that depends on the provider being connected
    } catch (error) {
      console.error(`Error connecting to network: ${error}`);
      // handle the error as needed
    }
  }
  

checkConnection();   

console.log(ethers.BigNumber.from("1000000000000000000").toHexString())



async function main() {
    const poolContract = new ethers.Contract(
      poolAddress,
      IUniswapV3PoolABI,
      provider
    )
  
    const immutables = await getPoolImmutables(poolContract)
    const state = await getPoolState(poolContract)
  
    const wallet = new ethers.Wallet(WALLET_SECRET)
    const connectedWallet = wallet.connect(provider)
  
    const swapRouterContract = new ethers.Contract(
      swapRouterAddress,
      SwapRouterABI,
      provider
    )
  
    const inputAmount = 0.001
    // .001 => 1 000 000 000 000 000
    const amountIn = ethers.utils.parseUnits(
      inputAmount.toString(),
      decimals0
    )
  
    const approvalAmount = (amountIn * 100000).toString()
    const tokenContract0 = new ethers.Contract(
      address0,
      ERC20ABI,
      provider
    )
    const approvalResponse = await tokenContract0.connect(connectedWallet).approve(
      swapRouterAddress,
      approvalAmount
    )
  
    const params = {
      tokenIn: immutables.token1,
      tokenOut: immutables.token0,
      fee: immutables.fee,
      recipient: WALLET_ADDRESS,
      deadline: Math.floor(Date.now() / 1000) + (60 * 10),
      amountIn: amountIn,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    }

    // Set gas limit to 500,000 units of gas
    const gasLimit = ethers.BigNumber.from("1000000").toHexString()
  
    const transaction = swapRouterContract.connect(connectedWallet).exactInputSingle(
      params,
      {
        //gasLimit: ethers.utils.hexlify(1000000)
        gasLimit: gasLimit
      }
    ).then(transaction => {
      console.log(transaction)
    })
  }
  
  main()

// https://arbiscan.io/address/0xc31e54c7a869b9fcbecc14363cf510d1c41fa443#readContract // read contract
// https://www.geckoterminal.com/de/arbitrum/pools/0xc31e54c7a869b9fcbecc14363cf510d1c41fa443
// next tuturial: 
// V2: https://www.quicknode.com/guides/defi/dexs/how-to-swap-tokens-on-uniswap-with-ethersjs/