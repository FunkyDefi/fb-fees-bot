require('dotenv').config('./.env');
const axios = require('axios');
// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { setupProvider, getERC20BalanceFormatted } = require('./blockchainService')

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES] });
const provider = setupProvider(process.env.HTTP_PROVIDER)

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
	setInterval(async () => {
		const treasuryWallet = '0xA20CA7c6705fB88847Cbf50549D7A38f4e99d32c'
		const totalPromise = axios.get(`https://openapi.debank.com/v1/user/chain_balance?id=${treasuryWallet}&chain_id=ftm`)
		const usdcPromise = getERC20BalanceFormatted('0x04068da6c83afcfa0e13ba15a6696662335d5b75', treasuryWallet, provider)
		const daiPromise = getERC20BalanceFormatted('0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e', treasuryWallet, provider)
		const mimPromise = getERC20BalanceFormatted('0x82f0b8b456c1a451378467398982d4834b6829c1', treasuryWallet, provider)
		const [totalBalanceResponse, usdcBalance, daiBalance, mimBalance] = await Promise.all([totalPromise, usdcPromise, daiPromise, mimPromise])
		const usdcString = usdcBalance.toFixed(2)
		const daiString = daiBalance.toFixed(2)
		const mimString = mimBalance.toFixed(2)
		const totalBalance = totalBalanceResponse.data.usd_value.toFixed(2)
		console.log(`Balance: |${totalBalance}| USDC: |${usdcString}| DAI: |${daiString}| MIM: |${mimString}|`)
		client.user.setActivity(`Balance: $${totalBalance} USDC: ${usdcString} DAI: ${daiString} MIM: ${mimString}`)
		// await client.user.setUsername(`$${totalBalance}`)
	}, 15000)
});



// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
