import fs from "fs";
import { wait, sleep, random, readWallets, writeLineToFile } from './common.js';
import axios from "axios";
import * as ethers from "ethers";
import {checkPass, isMinted, submitTx, waitForGas, getContractData} from "./common-mintfun.js";

const args = process.argv.slice(2);
let count = 1;
let networkId;
let provider;

if (args[0]) {
   count = args[0];
}

provider = new ethers.providers.JsonRpcProvider("https://rpc.zora.co");
networkId = 7777777;

let contracts = [
    '0x53cb0B849491590CaB2cc44AF8c20e68e21fc36D',
    '0xDcFB6cB9512E50dC54160cB98E5a00B3383F6A53'
]

async function mint(wallet) {
    const address = await wallet.getAddress();
    const nftContractAddress = contracts[random(0, contracts.length-1)];
    const nftContractABI = JSON.parse(fs.readFileSync(`./contracts/${nftContractAddress}.json`));
    const value = 0;
    const nftContract = new ethers.Contract(nftContractAddress, nftContractABI, wallet);

    try {
        const data = getContractData(nftContract, nftContractAddress, address);
        const nonce = await provider.getTransactionCount(address);

        const tx = {
            type: 2,
            chainId: networkId,
            to: nftContractAddress,
            data: data,
            nonce: nonce,
            value: value.toString(),
        };

        tx.maxFeePerGas = ethers.utils.parseUnits("0.0002", "gwei");
        tx.maxPriorityFeePerGas = ethers.utils.parseUnits("0.0002", "gwei");
        tx.gasLimit = 2000000;
        tx.value = ethers.utils.parseUnits(value.toString(), 'ether');

        const signedTx = await wallet.signTransaction(tx);
        const txResponse = await provider.sendTransaction(signedTx);
        await submitTx(address, txResponse.hash, networkId);
        console.log(`${address}: ${nftContractAddress} успешно заминчен: ${ txResponse.hash }`);
        await sleep(random(30, 38) * 1000);
    } catch (e) {
        console.log(e);
    }
}

const privateKeys = readWallets('private_keys.txt');

for (let privateKey of privateKeys) {
    const wallet = new ethers.Wallet(privateKey, provider);
    const address = await wallet.getAddress();
    console.log(`${address}: Работаем с кошельком`);

    for (let i = 0; i < count; i++) {
        console.log(`Минт ${i+1}/${count}`);
        await mint(wallet)
    }

    await sleep(1.5 * 1000);
}