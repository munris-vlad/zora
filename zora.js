import fs from "fs"
import {
    sleep,
    random,
    readWallets,
    getContractData,
    freeContracts,
    paidContracts
} from './common.js'
import * as ethers from "ethers"
import {isMinted, submitTx} from "./common-mintfun.js"

const args = process.argv.slice(2)
let count = 1
let type = 'free'
let networkId
let provider
let countFrom = null, countTo = null

if (args[0]) {
   count = args[0]
   if (count.includes('-')) {
       [countFrom, countTo] = count.split('-')
   }
}

if (args[1]) {
   type = args[1]
}

provider = new ethers.providers.JsonRpcProvider("https://zora.rpc.thirdweb.com")
networkId = 7777777

async function mint(wallet, nftContractAddress, value) {
    const address = await wallet.getAddress()
    let nftContractABI

    if (freeContracts.includes(nftContractAddress)) {
        nftContractABI = JSON.parse(fs.readFileSync(`./contracts/zora-free.json`))
    } else {
        nftContractABI = JSON.parse(fs.readFileSync(`./contracts/zora-paid.json`))
    }

    const nftContract = new ethers.Contract(nftContractAddress, nftContractABI, wallet)

    try {
        const data = getContractData(nftContract, nftContractAddress, address)
        const nonce = await provider.getTransactionCount(address)

        const tx = {
            type: 2,
            chainId: networkId,
            to: nftContractAddress,
            data: data,
            nonce: nonce,
            value: ethers.utils.parseUnits(value.toString(), 'ether'),
            maxFeePerGas: ethers.utils.parseUnits("0.0005", "gwei"),
            maxPriorityFeePerGas: ethers.utils.parseUnits("0.0005", "gwei"),
            gasLimit: 2000000
        }

        const signedTx = await wallet.signTransaction(tx)
        const txResponse = await provider.sendTransaction(signedTx)
        await submitTx(address, txResponse.hash, networkId)
        console.log(`${address}: ${nftContractAddress} успешно заминчен: https://explorer.zora.energy/tx/${ txResponse.hash }`)
        await sleep(random(30, 100) * 1000)
    } catch (e) {
        console.log(e)
    }
}

async function definePaidContract(wallet) {
    let contractToMint, value
    for (const contract of paidContracts) {
        if (!await isMinted(wallet, contract.address, networkId)) {
            contractToMint = contract.address
            value = contract.value
            break
        }
    }

    return [contractToMint, value]
}

const privateKeys = readWallets('private_keys.txt')

for (let privateKey of privateKeys) {
    const wallet = new ethers.Wallet(privateKey, provider)
    const address = await wallet.getAddress()
    console.log(`${address}: Работаем с кошельком`)
    let nftContractAddress = '', value = 0

    const iteration = countFrom !== null ? random(countFrom, countTo) : count

    if (type !== 'free' && type !== 'holograph') {
        const balance = Number(await wallet.getBalance())
        if (balance < 999000000000000) {
            console.log(`${address}: Баланс недостаточный для платных минтов, переключаемся в Free`)
            type = 'free'
        }
    }

    for (let i = 0; i < iteration; i++) {
        if (type === 'free') {
            nftContractAddress = freeContracts[random(0, freeContracts.length-1)]
            console.log(`${address}: FREE Mint ${i+1}/${iteration}`)
        } else if (type === 'paid') {
            [nftContractAddress, value] = await definePaidContract(address)
            console.log(`${address}: PAID Mint ${i+1}/${iteration}`)
        } else if (type === 'all') {
            let whatToMint = random(0, 1)
            if (whatToMint) {
                [nftContractAddress, value] = await definePaidContract(address)
                if (!nftContractAddress) { // if haven't available paid contracts, mint free
                    nftContractAddress = freeContracts[random(0, freeContracts.length-1)]
                    console.log(`${address}: Все платные NFT заминчены, минтим FREE ${i+1}/${iteration}`)
                } else {
                    console.log(`${address}: PAID Mint ${i+1}/${iteration}`)
                }
            } else {
                nftContractAddress = freeContracts[random(0, freeContracts.length-1)]
                console.log(`${address}: FREE Mint ${i+1}/${iteration}`)
            }
        } else if (type === 'holograph') {
            nftContractAddress = '0x02e591665b785cDa7404e005C323c262667d6F54'
            value = 0.000042
            console.log(`${address}: Holograph mint`)
        }

        if (nftContractAddress === '' || !nftContractAddress) {
            console.log(`${address}: Нет доступного контракта для минта. Пропускаем...`)
            continue
        }

        await mint(wallet, nftContractAddress, value)
    }
}