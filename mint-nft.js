import { wait, sleep, random, readWallets, writeLineToFile } from './common.js';
import fs from "fs";
import axios from "axios";
import * as ethers from "ethers";
import {checkPass, isMinted, submitTx, waitForGas, getContractData} from "./common-mintfun.js";

let contracts;
const args = process.argv.slice(2);
let network = 'eth';
let networkId;
let provider;

if (args[0]) {
   network = args[0];
}

switch (network) {
    case 'eth':
        contracts = JSON.parse(fs.readFileSync("./contracts/contracts-eth.json"));
        provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth");
        networkId = 1;
        break;

    case 'optimism':
        contracts = JSON.parse(fs.readFileSync("./contracts/contracts-optimism.json"));
        provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/optimism");
        networkId = 10;
        break;

    case 'base':
        contracts = JSON.parse(fs.readFileSync("./contracts/contracts-base.json"));
        provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/base");
        networkId = 8453;
        break;

    case 'zora':
        contracts = JSON.parse(fs.readFileSync("./contracts/contracts-zora.json"));
        provider = new ethers.providers.JsonRpcProvider("https://rpc.zora.co");
        networkId = 7777777;
        break;
}

const maxGas = 20;

async function mint(wallet) {
    const address = await wallet.getAddress();
    for (const nftContractAddress in contracts) {
        if (!await isMinted(address, nftContractAddress, networkId)) {
            const nftContractABI = JSON.parse(fs.readFileSync(`./contracts/${nftContractAddress}.json`));
            const value = contracts[nftContractAddress];
            const nftContract = new ethers.Contract(nftContractAddress, nftContractABI, wallet);

            try {
                const data = getContractData(nftContract, nftContractAddress, address);
                const nonce = await provider.getTransactionCount(address);
                const gasPrice = await provider.getGasPrice()
                const maxPriority = parseInt(ethers.utils.formatUnits(gasPrice.toString(), "gwei"));
                const tx = {
                    type: 2,
                    chainId: networkId,
                    to: nftContractAddress,
                    data: data,
                    nonce: nonce,
                    value: value.toString(),
                };

                switch (network) {
                    case 'eth':
                        tx.maxFeePerGas = ethers.utils.parseUnits(maxPriority.toString(), "gwei");
                        tx.maxPriorityFeePerGas = ethers.utils.parseUnits("0.1", "gwei");
                        tx.gasLimit = 120000;
                        break;
                    case 'optimism':
                        tx.maxFeePerGas = ethers.utils.parseUnits("1", "gwei");
                        tx.maxPriorityFeePerGas = ethers.utils.parseUnits("0.1", "gwei");
                        tx.gasLimit = 500000;
                        break;
                    case 'base':
                        tx.maxFeePerGas = ethers.utils.parseUnits("1", "gwei");
                        tx.maxPriorityFeePerGas = ethers.utils.parseUnits("0.4", "gwei");
                        tx.gasLimit = 200000;
                        break;
                    case 'zora':
                        tx.maxFeePerGas = ethers.utils.parseUnits("0.005", "gwei");
                        tx.maxPriorityFeePerGas = ethers.utils.parseUnits("0.005", "gwei");
                        tx.gasLimit = 200000;
                        tx.value = ethers.utils.parseUnits(value.toString(), 'ether');;
                        break;
                }

                const signedTx = await wallet.signTransaction(tx);
                const txResponse = await provider.sendTransaction(signedTx);
                await submitTx(address, txResponse.hash, networkId);
                console.log(`${address}: ${nftContractAddress} успешно заминчен: ${ txResponse.hash }`);
                await sleep(random(30, 38) * 1000);
            } catch (e) {
                console.log(e);
            }

            return;
        } else {
            console.log(`${address}: ${nftContractAddress} уже был заминчен ранее`);
        }
    }
}

const privateKeys = readWallets('private_keys.txt');

for (let privateKey of privateKeys) {
    const wallet = new ethers.Wallet(privateKey, provider);
    const address = await wallet.getAddress();
    console.log(`${address}: Работаем с кошельком`);
    await waitForGas(maxGas);

    if (await checkPass(address)) {
        await mint(wallet)
    } else {
        console.log(`${address}: Fundrop еще не заминчен`);
    }
    await sleep(1.5 * 1000);
}