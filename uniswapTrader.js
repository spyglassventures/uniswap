
// Import the 'ethers' library
const { ethers } = require('ethers')

// Import the ABI (Application Binary Interface) of the 'IUniswapV3Pool' contract from the '@uniswap/v3-core' library
const { abi: IUniswapV3PoolABI } = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json')

// Import the ABI of the 'SwapRouter' contract from the '@uniswap/v3-periphery' library
const { abi: SwapRouterABI } = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json')

// Import helper functions from the './helpers' file located in the same directory
const { getPoolImmutables, getPoolState } = require('./helpers')

// Import the ABI of an ERC20 contract from a JSON file located in the same directory
const ERC20ABI = require('./abi.json')

require('dotenv').config()
const INFURA_URL_TESTNET = process.env.INFURA_URL_TESTNET
const WALLET_ADDRESS = process.env.WALLET_ADDRESS
const WALLET_SECRET = process.env.WALLET_SECRET

const provider = new ethers.providers.JsonRpcProvider(INFURA_URL_TESTNET) // Arbitrum
// src: https://www.geckoterminal.com/de/arbitrum/pools/0xc31e54c7a869b9fcbecc14363cf510d1c41fa443
const poolAddress = "0xc31e54c7a869b9fcbecc14363cf510d1c41fa443" // WETH/USDC Pool w/ Uniswap (Arbitrum) 
// src: https://docs.uniswap.org/contracts/v3/reference/deployments, same for Mainnet and Testnet
const SwapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564"

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

async function main() {
    const poolContract = new ethers.Contract(
        poolAddress,
        IUniswapV3PoolABI,
        provider
    )
    
    const immutables = await getPoolImmutables(poolContract)
    const state = await getPoolState(poolContract)

    // connect wallet via https://docs.ethers.org/v5/api/signer/#Wallet
    const wallet = new ethers.Wallet(WALLET_SECRET)
    const connectedWallet = wallet.connect(provider)

    const swapRouterContract = new ethers.Contract(
        SwapRouterAddress,
        SwapRouterABI,
        provider
    )

    const inputAmount = 0.001
    // .001 => 1 000 000 000 000 000
    const amountIn = ethers.utils.parseUnits(
        inputAmount.toString(),
        decimals0
    )

    // approve function so Uniswap can access your wallet
    const approvalAmount = (amountIn * 10000 ).toString() // maxium amount
    const tokenContract0 = new ethers.Contract(
        address0,
        ERC20ABI,
        provider
    )
    const approvalResponse = await tokenContract0.connect(connectedWallet).approve(
        SwapRouterAddress,
        approvalAmount
    )

    // https://docs.uniswap.org/contracts/v3/reference/periphery/SwapRouter
    // https://docs.uniswap.org/contracts/v3/reference/periphery/interfaces/ISwapRouter

    const params = {
        tokenIn: immutables.token1,
        tokenOut: immutables.token0,
        fee: immutables.fee,
        recipient: WALLET_ADDRESS,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10), // 10 mins
        amountIn: amountIn,
        amountOutMinimum: 0, 
        sqrtPriceLimitX96: 0,
        }

        const transaction = swapRouterContract.connect(connectedWallet).exactInputSingle(
            params,
            {
                gasLimit: ethers.utils.hexlify(100000)
            }
        ).then(transaction => {
            console.log(transaction)
        })
}

main()


// https://arbiscan.io/address/0xc31e54c7a869b9fcbecc14363cf510d1c41fa443#readContract // read contract
// https://www.geckoterminal.com/de/arbitrum/pools/0xc31e54c7a869b9fcbecc14363cf510d1c41fa443