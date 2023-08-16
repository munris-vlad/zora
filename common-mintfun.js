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

export async function isMinted(address, contract, network) {
    try {
        const response = await axios.get(mintCheckApiUrl+`${network}:${contract}/minted`, {
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
        case "0x90fb81ca2fec713c9c6b4b2694eded668b85d5ed":
            data = nftContract.interface.encodeFunctionData('mint', [1]);
            break;
        case "0xcf3681688cf41f14952024cb1ff21f8033a0d8a1":
            data = nftContract.interface.encodeFunctionData('freeMint');
            break;
        case "0xfA97094bE18130CD651Aa9e054B8b7b626434000":
            data = nftContract.interface.encodeFunctionData('freeMint');
            break;
        case "0xCc804DFA58Bf38fc32F45C6214c7130b324637d4":
            data = nftContract.interface.encodeFunctionData('mintAmount', [3]);
            break;
        case "0x3f1201a68b513049f0f6e182f742a0dce970d8cd":
            data = nftContract.interface.encodeFunctionData('purchase', [1]);
            break;
        case "0x81d226fb36ca785583e79e84312335d0e166d59b":
            data = nftContract.interface.encodeFunctionData('purchase', [1]);
            break;
        case "0xa545f209fb4997bccdf991d21be1eccd714569fb":
            data = nftContract.interface.encodeFunctionData('purchase', [1]);
            break;
        case "0x48378bbf8948ffe4f32fa58646b7d7fe624de922":
            data = nftContract.interface.encodeFunctionData('purchase', [1]);
            break;
        case "0x53cb0B849491590CaB2cc44AF8c20e68e21fc36D":
            data = nftContract.interface.encodeFunctionData('mint', [3]);
            break;
        case "0x26b0e11e56562fc2d19701c007d1e04230fe5cd9":
            data = nftContract.interface.encodeFunctionData('freeMint');
            break;
        case "0x012caeb558dffc053a6a092835a1e7f5c8eeba8b":
            data = nftContract.interface.encodeFunctionData('mint', [10]);
            break;
        case "0xDcFB6cB9512E50dC54160cB98E5a00B3383F6A53":
            data = nftContract.interface.encodeFunctionData('mint', [100]);
            break;
        case "0x266b7E8Df0368Dd4006bE5469DD4EE13EA53d3a4":
            data = nftContract.interface.encodeFunctionData('mint', [3]);
            break;
        case "0x4de73D198598C3B4942E95657a12cBc399E4aDB5":
            data = nftContract.interface.encodeFunctionData('mint', [1]);
            break;
        case "0xCc4FF6BB314055846e46490B966745E869546B4a":
            data = nftContract.interface.encodeFunctionData('mint', [100]);
            break;
        case "0x12B93dA6865B035AE7151067C8d264Af2ae4be8E":
            data = nftContract.interface.encodeFunctionData('mint', [10]);
            break;
        case "0x9eAE90902a68584E93a83D7638D3a95ac67FC446":
            data = nftContract.interface.encodeFunctionData('mint', [3]);
            break;
        case "0x4073a52A3fc328D489534Ab908347eC1FcB18f7f":
            data = nftContract.interface.encodeFunctionData('mint', [3]);
            break;
        case "0xA85B9F9154db5bd9C0b7F869bC910a98ba1b7A87":
            data = nftContract.interface.encodeFunctionData('mint', [3]);
            break;
        case "0xC47ADb3e5dC59FC3B41d92205ABa356830b44a93":
            data = nftContract.interface.encodeFunctionData('mint', [2]);
            break;
        case "0xca5F4088c11B51c5D2B9FE5e5Bc11F1aff2C4dA7":
            data = nftContract.interface.encodeFunctionData('mint', [2]);
            break;
        case "0x8A43793D26b5DBd5133b78A85b0DEF8fB8Fce9B3":
            data = nftContract.interface.encodeFunctionData('mint', [99]);
            break;

    }

    return data;
}