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

export function getContractData(nftContract, nftContractAddress, address = null) {
    let data;
    switch (nftContractAddress) {
        case "0x2F47cA81a38CB76F94256706750a4eA879E7CF9F":
            data = nftContract.interface.encodeFunctionData('mint', [10]);
            break;
        case "0x7BB824EceD0a777C17ac0000B0E7f8e036F1538f":
            data = nftContract.interface.encodeFunctionData('mint', [10]);
            break;
        case "0x4790E4cbaC1AdD9278554211663aCd14Cf45f543":
            data = nftContract.interface.encodeFunctionData('mint', [10]);
            break;
        case "0x0A791089ACf48912a9Cfde00E3A6aFe9eDBC3221":
            data = nftContract.interface.encodeFunctionData('mint', [10]);
            break;
        case "0x10Ec466749a26B90704f2F5F7D4C72Aa48908D71":
            data = nftContract.interface.encodeFunctionData('mint', [10]);
            break;
        case "0x51682f90495A50Ada5Cf3380f9Ea59E2eEbafDC0":
            data = nftContract.interface.encodeFunctionData('mint', [10]);
            break;
        case "0xCEbcF213F4B01321AB2F672ab0cdC2FC400E297c":
            data = nftContract.interface.encodeFunctionData('mint', [
                10,
                address
            ]);
            break;
        case "0xcBA5609AB435969dEF6Ab164c4C0A4165E805783":
            data = nftContract.interface.encodeFunctionData('mint', [
                address,
                1
            ]);
            break;
    }

    return data;
}