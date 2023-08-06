import { wait, sleep, random, readWallets, writeLineToFile } from './common.js';
import { checkPass, waitForGas} from './common-mintfun.js';
import fs from "fs";
import axios from "axios";
import * as ethers from "ethers";
import randomUseragent from "random-useragent"

const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth");
const fundropContractAddress = '0x0000000000664ceffed39244a8312bD895470803';
const fundropContractABI = JSON.parse(fs.readFileSync("./abi-fundrop.json"));
const referrer = '0x2300f68064BfaafA381cd36f2695CDfEAAc09231';
const maxGas = 15;

async function getSign(address, referrer) {
    const url = `https://mint.fun/api/mintfun/fundrop/mint?address=${address}&referrer=${referrer}`;
    const headers = {
        'User-Agent': randomUseragent.getRandom(),
        'Referer': `https://mint.fun/fundrop?ref=${referrer}`
    };

    const response = await axios.get(url, {
        headers: headers
    });

    return response.data.signature;
}

async function mint(wallet, signature) {
    const fundropContract = new ethers.Contract(fundropContractAddress, fundropContractABI, wallet);
    const address = await wallet.getAddress();
    try {
        const data = fundropContract.interface.encodeFunctionData('mint', [
            referrer,
            signature
        ]);

        const nonce = await provider.getTransactionCount(address);
        const gasLimit = await fundropContract.estimateGas.mint(referrer, signature);
        const gasPrice = await provider.getGasPrice()
        const maxPriority = parseInt(ethers.utils.formatUnits(gasPrice.toString(), "gwei"));

        const tx = {
            type: 2,
            chainId: 1,
            to: fundropContractAddress,
            data: data,
            nonce: nonce,
            gasLimit: gasLimit,
            maxFeePerGas: ethers.utils.parseUnits(maxPriority.toString(), "gwei"),
            maxPriorityFeePerGas: ethers.utils.parseUnits("0.1", "gwei"),
        };

        const signedTx = await wallet.signTransaction(tx);
        const txResponse = await provider.sendTransaction(signedTx);
        console.log(`${address}: Fundrop Pass успешно заминчен: ${ txResponse.hash }`);
        await sleep(random(30, 38) * 1000);
    } catch (e) {
        console.log(e);
    }
}

const privateKeys = readWallets('private_keys.txt');

for (let privateKey of privateKeys) {
    const wallet = new ethers.Wallet(privateKey, provider);
    const address = await wallet.getAddress();
    await waitForGas(maxGas);

    if (!await checkPass(address)) {
        let signature = await getSign(address, referrer);
        await mint(wallet, signature);
    } else {
        console.log(`${address}: Fundrop уже заминчен`);
    }
    await sleep(1.5 * 1000);
}