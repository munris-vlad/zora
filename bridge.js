import fs from "fs"
import {
    sleep,
    random,
    readWallets,
    getContractData,
    bridgeContractAddress, bridgeContractABI, getAmount
} from './common.js'
import * as ethers from "ethers"
import Orbiter from './orbiter.js'

// node bridge official 0.005-0.007
// node bridge orbiter 0.005-0.007 arbitrum

const maxGas = 20
const args = process.argv.slice(2)
let value, valueFrom, valueTo = 0.005
let type = 'orbiter'
let fromChain = 'arbitrum'

if (args[0]) {
   type = args[0]
}

if (args[1]) {
   value = args[1]
   if (value.includes('-')) {
       [valueFrom, valueTo] = value.split('-')
   } else {
       [valueFrom, valueTo] = [value, value]
   }
}

if (args[2]) {
   fromChain = args[2]
}

const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth")

async function waitForGas(maxGas) {
    while (true) {
        const gasPrice = await provider.getGasPrice()
        const currentGas = parseInt(ethers.utils.formatUnits(gasPrice.toString(), "gwei"))
        if (currentGas <= maxGas) {
            return currentGas
        }
        console.log(`Ждем газ ${maxGas}. Текущий газ: ${currentGas}`)
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
}

async function officialBridge(wallet) {
    const address = await wallet.getAddress()
    const feeData = await provider.getFeeData()
    let value = getAmount(valueFrom, valueTo)
    value = ethers.utils.parseEther(value.toString())
    const bridgeContract = new ethers.Contract(bridgeContractAddress, bridgeContractABI, wallet)

    try {
        const nonce = await provider.getTransactionCount(address)
        const data = bridgeContract.interface.encodeFunctionData('depositTransaction', [
            address,
            value.toString(),
            100000,
            0,
            '0x'
        ])

        const tx = {
            type: 2,
            chainId: 1,
            to: bridgeContractAddress,
            data: data,
            nonce: nonce,
            value: value.toString(),
            maxFeePerGas: feeData.maxFeePerGas.toString(),
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas.toString()
        }

        tx.gasLimit = await provider.estimateGas(tx)

        const signedTx = await wallet.signTransaction(tx)
        const txResponse = await provider.sendTransaction(signedTx)
        console.log(`${address}: Успешный офф бридж https://etherscan.io/tx/${ txResponse.hash }`)
    } catch (e) {
        console.log(e.toString())
    }
}

async function orbiter(wallet, fromChain, toChain) {
    const orbiter = new Orbiter(wallet, fromChain, toChain)
    await orbiter.bridge(toChain, valueFrom, valueTo)
}

const privateKeys = readWallets('private_keys.txt')

for (let privateKey of privateKeys) {
    const wallet = new ethers.Wallet(privateKey, provider)
    const address = await wallet.getAddress()
    console.log(`${address}: Работаем с кошельком`)

    if (type === 'official') {
        await waitForGas(maxGas)
        await officialBridge(wallet)
    } else {
        if (fromChain !== 'arbitrum' || fromChain !== 'optimism') {
            console.warn(`\u001b[1;31mOrbiter бридж только из Arbitrum или Optimism, завершаем работу \x1b[0m`)
            process.exit(0)
        }

        const gasPrice = await provider.getGasPrice()
        const currentGas = parseInt(ethers.utils.formatUnits(gasPrice.toString(), "gwei"))
        if (currentGas < 20) {
            console.warn(`\u001b[1;31mТекущий газ ${currentGas}, вероятно что офф бридж дешевле, чем orbiter. Ждем 10 сек и начинаем \x1b[0m`)
            await sleep(10 * 1000)
        }

        await orbiter(privateKey, fromChain, 'zora')
    }

    await sleep(random(30, 100) * 1000)
}