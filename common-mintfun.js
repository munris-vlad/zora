const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth");
import axios from "axios";
import * as ethers from "ethers";
import fs from "fs";

const apiUrl = "https://mint.fun/api/mintfun/fundrop/pass";
const mintCheckApiUrl = "https://mint.fun/api/mintfun/contract/";
const submitTxApiUrl = "https://mint.fun/api/mintfun/submit-tx";

export async function checkPass(address) {
    try {
        const response = await axios.get(apiUrl, {
            params: {
                address: address
            }
        });

        return true;
    } catch (error) {
        return false;
    }
}

export async function isMinted(address, contract) {
    try {
        const response = await axios.get(mintCheckApiUrl+`1:${contract}/minted`, {
            params: {
                address: address
            }
        });
        const count = response.data.count;

        return count > 0;
    } catch (error) {
        return 0;
    }
}

export async function submitTx(address, hash, chainId = 1) {

    axios.post(submitTxApiUrl, {
        address: address,
        chainId: chainId,
        hash: hash,
        isAllowlist: false,
        source: 'projectPage'
      })
      .then(function (response) {})
      .catch(function (error) {
        console.log(error);
      });
}

export async function waitForGas(maxGas) {
    while (true) {
        const gasPrice = await provider.getGasPrice();
        const currentGas = parseInt(ethers.utils.formatUnits(gasPrice.toString(), "gwei"));
        if (currentGas <= maxGas) {
            return currentGas;
        }
        console.log(`Ждем газ ${maxGas}. Текущий газ: ${currentGas}`);
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
}

export function getRandomContract() {
    const keys = Object.keys(contracts);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return [randomKey, contracts[randomKey]];
}