import { wait, sleep, random, readWallets, writeLineToFile } from './common.js';
import fs from "fs";
import axios from "axios";
import * as ethers from "ethers";
import {checkPass, isMinted, submitTx, waitForGas} from "./common-mintfun.js";

const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth");
const nftContractABI = JSON.parse(fs.readFileSync("./abi-nft-contract.json"));
const contracts = JSON.parse(fs.readFileSync("./contracts.json"));

const maxGas = 20;

async function mint(wallet) {
    const address = await wallet.getAddress();
    for (const nftContractAddress in contracts) {
        if (!await isMinted(address, nftContractAddress)) {
            const value = contracts[nftContractAddress];
            const nftContract = new ethers.Contract(nftContractAddress, nftContractABI, wallet);

            try {
                const data = nftContract.interface.encodeFunctionData('mint', [10]);

                const nonce = await provider.getTransactionCount(address);
                const gasPrice = await provider.getGasPrice()
                const maxPriority = parseInt(ethers.utils.formatUnits(gasPrice.toString(), "gwei"));

                const tx = {
                    type: 2,
                    chainId: 1,
                    to: nftContractAddress,
                    data: data,
                    nonce: nonce,
                    value: ethers.utils.parseEther(value),
                    gasLimit: 120000,
                    maxFeePerGas: ethers.utils.parseUnits(maxPriority.toString(), "gwei"),
                    maxPriorityFeePerGas: ethers.utils.parseUnits("0.1", "gwei"),
                };

                const signedTx = await wallet.signTransaction(tx);
                const txResponse = await provider.sendTransaction(signedTx);
                await submitTx(address, txResponse.hash);
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