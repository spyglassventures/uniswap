

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
    const gasLimit = ethers.utils.hexlify(value = 0x53EC60);
  
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