const { Contract, providers, utils } = require('ethers');
const ERC20ABI = require('./erc20abi');

const getERC20Balance = async (tokenAddress, walletAddress, provider) => {
  const contract = new Contract(tokenAddress, ERC20ABI, provider);
  return contract.balanceOf(walletAddress);
};

const getERC20BalanceFormatted = async (tokenAddress, walletAddress, provider) => {
  const contract = new Contract(tokenAddress, ERC20ABI, provider);
  const decimals = await contract.decimals();
  const balance = await contract.balanceOf(walletAddress);
  return parseFloat(utils.formatUnits(balance, decimals));
}

const setupProvider = (httpProviderUrl) => {
  return new providers.JsonRpcProvider(httpProviderUrl)
}

module.exports = {
  getERC20Balance,
  setupProvider,
  getERC20BalanceFormatted
}
