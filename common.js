import fs from "fs";

export const wait = ms => new Promise(r => setTimeout(r, ms));
export const sleep = async (millis) => new Promise(resolve => setTimeout(resolve, millis));

export function random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function readWallets(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line !== '');
        return lines;
    } catch (error) {
        console.error('Error reading the file:', error.message);
        return [];
    }
}


export function writeLineToFile(filePath, line) {
    try {
        fs.appendFileSync(filePath, line + '\n', 'utf-8');
    } catch (error) {
        console.error('Error appending to the file:', error.message);
    }
}

export function getAmount(minAmount, maxAmount) {
    const randomNumber = Math.random() * (maxAmount - minAmount) + minAmount

    if (isNaN(randomNumber)) {
        throw new Error("Invalid calculation result: Not a number.")
    }

    return parseFloat(randomNumber).toFixed(18)
}

export function getRandomFreeContract() {
    const keys = Object.keys(contracts);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return [randomKey, contracts[randomKey]];
}


export const bridgeContractAddress = '0x1a0ad011913a150f69f6a19df447a0cfd9551054'
export const bridgeContractABI = JSON.parse(fs.readFileSync(`./contracts/official-bridge.json`))

export const freeContracts = [
    '0x53cb0B849491590CaB2cc44AF8c20e68e21fc36D',
    '0x266b7E8Df0368Dd4006bE5469DD4EE13EA53d3a4',
    '0x4de73D198598C3B4942E95657a12cBc399E4aDB5',
    '0x9eAE90902a68584E93a83D7638D3a95ac67FC446',
    '0x4073a52A3fc328D489534Ab908347eC1FcB18f7f',
    '0xA85B9F9154db5bd9C0b7F869bC910a98ba1b7A87',
    '0xC47ADb3e5dC59FC3B41d92205ABa356830b44a93',
    '0x8A43793D26b5DBd5133b78A85b0DEF8fB8Fce9B3',
    '0x4DAc7C0e081eC0F7AB20BE1124422C9174C52365',
    '0xE444d94e3eaFE9e4d3f5801D0AA0c69a698e78A0',
    '0x5CB3Be6681E5aF9644F5356EbbaEE55BfCF86222',
    '0xE5405B1DFb75fDC60f1D136817e42A599b673475',
    '0x060083a689a91888339A69F50a41238d20BC8Dd6',
    '0xbC2cA61440fAF65a9868295Efa5d5D87c55B9529',
    '0x199A21f0be1cdcdd882865E7d0F462e4778c5ee4'
]

export const paidContracts = [
    {
        address: '0x4ad3cd57a68149a5c5d8a41919dc8ac02d00a366',
        value: 0.000777
    },
    {
        address: '0x09dD68c87020055a19733a6CcD7bfc7e7DfB3483',
        value: 0.000777
    },
    {
        address: '0x350cd7e18fca65e3475385e03c9d838085051851',
        value: 0.000777
    },
    {
        address: '0x6fc5dbd33ab54f3e20ae9937109f01c91d8cf202',
        value: 0.000777
    }
]


export function getContractData(nftContract, nftContractAddress, address = null) {
    let data
    switch (nftContractAddress) {
        case "0x53cb0B849491590CaB2cc44AF8c20e68e21fc36D":
            data = nftContract.interface.encodeFunctionData('mint', [3])
            break
        case "0x266b7E8Df0368Dd4006bE5469DD4EE13EA53d3a4":
            data = nftContract.interface.encodeFunctionData('mint', [3])
            break
        case "0x4de73D198598C3B4942E95657a12cBc399E4aDB5":
            data = nftContract.interface.encodeFunctionData('mint', [1])
            break
        case "0x2F47cA81a38CB76F94256706750a4eA879E7CF9F":
            data = nftContract.interface.encodeFunctionData('mint', [10])
            break
        case "0x9eAE90902a68584E93a83D7638D3a95ac67FC446":
            data = nftContract.interface.encodeFunctionData('mint', [3])
            break
        case "0x4073a52A3fc328D489534Ab908347eC1FcB18f7f":
            data = nftContract.interface.encodeFunctionData('mint', [3])
            break
        case "0xA85B9F9154db5bd9C0b7F869bC910a98ba1b7A87":
            data = nftContract.interface.encodeFunctionData('mint', [3])
            break
        case "0xC47ADb3e5dC59FC3B41d92205ABa356830b44a93":
            data = nftContract.interface.encodeFunctionData('mint', [2])
            break
        case "0x8A43793D26b5DBd5133b78A85b0DEF8fB8Fce9B3":
            data = nftContract.interface.encodeFunctionData('mint', [99])
            break
        case "0x4DAc7C0e081eC0F7AB20BE1124422C9174C52365":
            data = nftContract.interface.encodeFunctionData('mint', [100])
            break
        case "0xE444d94e3eaFE9e4d3f5801D0AA0c69a698e78A0":
            data = nftContract.interface.encodeFunctionData('mint', [100])
            break
        case "0x5CB3Be6681E5aF9644F5356EbbaEE55BfCF86222":
            data = nftContract.interface.encodeFunctionData('mint', [100])
            break
        case "0xE5405B1DFb75fDC60f1D136817e42A599b673475":
            data = nftContract.interface.encodeFunctionData('mint', [3])
            break
        case "0x060083a689a91888339A69F50a41238d20BC8Dd6":
            data = nftContract.interface.encodeFunctionData('mint', [3])
            break
        case "0xbC2cA61440fAF65a9868295Efa5d5D87c55B9529":
            data = nftContract.interface.encodeFunctionData('mint', [4])
            break
        case "0x199A21f0be1cdcdd882865E7d0F462e4778c5ee4":
            data = nftContract.interface.encodeFunctionData('mint', [2])
            break
        case "0x4ad3cd57a68149a5c5d8a41919dc8ac02d00a366":
            data = nftContract.interface.encodeFunctionData('mintWithRewards', [
                address,
                1,
                '',
                '0x277c2a47ac1aeb6f77b778dbed48d3d4feea8937'
            ])
            break
        case "0x09dD68c87020055a19733a6CcD7bfc7e7DfB3483":
            data = nftContract.interface.encodeFunctionData('mintWithRewards', [
                address,
                1,
                '',
                '0x277c2a47ac1aeb6f77b778dbed48d3d4feea8937'
            ])
            break
        case "0x350cd7e18fca65e3475385e03c9d838085051851":
            data = nftContract.interface.encodeFunctionData('mintWithRewards', [
                address,
                1,
                '',
                '0x277c2a47ac1aeb6f77b778dbed48d3d4feea8937'
            ])
            break
        case "0x6fc5dbd33ab54f3e20ae9937109f01c91d8cf202":
            data = nftContract.interface.encodeFunctionData('mintWithRewards', [
                address,
                1,
                '',
                '0x277c2a47ac1aeb6f77b778dbed48d3d4feea8937'
            ])
            break
        case "0x02e591665b785cDa7404e005C323c262667d6F54":
            data = nftContract.interface.encodeFunctionData('purchase', [1])
            break
    }

    return data
}