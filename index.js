if (process.env.NODE_ENV === 'development') {
	require('dotenv').config({ path: './.env-development' });
} else {
	require('dotenv').config({ path: './.env' });
}
const axios = require('axios');
// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { setupProvider, getERC20BalanceFormatted } = require('./blockchainService')

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS] });
const provider = setupProvider(process.env.HTTP_PROVIDER)

function adjustBalance(totalBalance, ftmPrice) {
	const ftmToDeduct = 320 + 10
	const usdRemoved = 0
	const currentBalance = totalBalance - (ftmToDeduct * ftmPrice) + usdRemoved
	return (currentBalance / 1000).toFixed(1)
}

function getData() {
		const treasuryWallet = '0xA20CA7c6705fB88847Cbf50549D7A38f4e99d32c'
		const totalPromise = axios.get(`https://openapi.debank.com/v1/user/chain_balance?id=${treasuryWallet}&chain_id=ftm`)
		const ftmPricePromise = axios.get(`https://openapi.debank.com/v1/token?chain_id=ftm&id=0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83`)
		const usdcPromise = getERC20BalanceFormatted('0x04068da6c83afcfa0e13ba15a6696662335d5b75', treasuryWallet, provider)
		const daiPromise = getERC20BalanceFormatted('0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e', treasuryWallet, provider)
		const mimPromise = getERC20BalanceFormatted('0x82f0b8b456c1a451378467398982d4834b6829c1', treasuryWallet, provider)
		const ftmPromise = getERC20BalanceFormatted('0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', treasuryWallet, provider)
		return Promise.all([totalPromise, ftmPricePromise, ftmPromise, usdcPromise, daiPromise, mimPromise])
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
	setInterval(async () => {
		const [totalBalanceResponse, ftmPrice, ftmBalance, usdcBalance, daiBalance, mimBalance] = await getData()
		const usdcString = usdcBalance.toFixed(2)
		const daiString = daiBalance.toFixed(2)
		const mimString = mimBalance.toFixed(2)
		const ftmString = ftmBalance.toFixed(2)
		const totalBalance = totalBalanceResponse.data.usd_value.toFixed(2)
		const ftmPriceUsd = ftmPrice.data.price
		let balance = adjustBalance(totalBalance, ftmPriceUsd)
		console.log(`[${Date().toLocaleString()}] Balance: |${totalBalance}| FTM: |${ftmString}| USDC: |${usdcString}| DAI: |${daiString}| MIM: |${mimString}|`)
		client.user.setActivity(`$${balance}k  FTM: ${ftmString}, USDC: ${usdcString} DAI: ${daiString} MIM: ${mimString}`)
		// await client.user.setUsername(`$${totalBalance}`)
	}, 15000)
});



// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
