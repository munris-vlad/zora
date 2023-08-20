import fs from "fs";
import { wait, sleep, random, readWallets, writeLineToFile } from './common.js';
import axios from "axios";
import * as ethers from "ethers";
import {checkPass, isMinted, submitTx, waitForGas, getContractData} from "./common-mintfun.js";

const args = process.argv.slice(2);
let count = 1;
let networkId;
let provider;
let countFrom = null, countTo = null

if (args[0]) {
   count = args[0];
   if (count.includes('-')) {
       [countFrom, countTo] = count.split('-')
   }
}

provider = new ethers.providers.JsonRpcProvider("https://rpc.zora.co");
networkId = 7777777;

let contracts = [
    '0x53cb0B849491590CaB2cc44AF8c20e68e21fc36D',
    '0x266b7E8Df0368Dd4006bE5469DD4EE13EA53d3a4',
    '0xDcFB6cB9512E50dC54160cB98E5a00B3383F6A53',
    '0x4de73D198598C3B4942E95657a12cBc399E4aDB5',
    '0xCc4FF6BB314055846e46490B966745E869546B4a',
    '0x12B93dA6865B035AE7151067C8d264Af2ae4be8E',
    '0x9eAE90902a68584E93a83D7638D3a95ac67FC446',
    '0x4073a52A3fc328D489534Ab908347eC1FcB18f7f',
    '0xA85B9F9154db5bd9C0b7F869bC910a98ba1b7A87',
    '0xC47ADb3e5dC59FC3B41d92205ABa356830b44a93',
    '0xca5F4088c11B51c5D2B9FE5e5Bc11F1aff2C4dA7',
    '0x8A43793D26b5DBd5133b78A85b0DEF8fB8Fce9B3',
    '0x4DAc7C0e081eC0F7AB20BE1124422C9174C52365',
    '0xE444d94e3eaFE9e4d3f5801D0AA0c69a698e78A0',
    '0x5CB3Be6681E5aF9644F5356EbbaEE55BfCF86222'
]

async function mint(wallet, nftContractAddress) {
    const address = await wallet.getAddress();
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

    const iteration = countFrom !== null ? random(countFrom, countTo) : count

    for (let i = 0; i < iteration; i++) {
        let nftContractAddress = contracts[random(0, contracts.length-1)];
        console.log(`Минт ${i+1}/${iteration}`);
        await mint(wallet, nftContractAddress)
    }

    await sleep(1.5 * 1000);
}