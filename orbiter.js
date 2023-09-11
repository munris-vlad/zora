import * as ethers from "ethers"
import {getAmount} from "./common.js";

const orbiterContract = "0xe4edb277e41dc89ab076a1f049f4a3efa700bce8"

export default class Orbiter {
    constructor(privateKey, fromChain, toChain) {
        switch (fromChain) {
            case 'arbitrum':
                this.provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/arbitrum")
                break
            case 'optimism':
                this.provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/optimism")
                break
        }
        this.fromChain = fromChain
        this.wallet = new ethers.Wallet(privateKey, this.provider)

        this.bridgeCodes = {
            ethereum: 9001,
            arbitrum: 9002,
            polygon: 9006,
            optimism: 9007,
            zksync: 9014,
            bsc: 9015,
            nova: 9016,
            zkevm: 9017,
            base: 9021,
            zora: 9030
        }
    }

    async getTxData(value, destinationChain) {
        const amount = ethers.utils.parseEther(value.toString()).add(this.bridgeCodes[destinationChain])
        const feeData = await this.provider.getFeeData()

        return {
            type: 2,
            chainId: (await this.provider.getNetwork()).chainId,
            nonce: await this.wallet.getTransactionCount(),
            to: orbiterContract,
            value: amount.toString(),
            maxFeePerGas: feeData.maxFeePerGas.toString(),
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas.toString()
        }
    }

    async bridge(destinationChain, minAmount, maxAmount) {
        const amount = getAmount(minAmount, maxAmount)

        if (amount < 0.005 || amount > 5) {
            console.error(`[${this.wallet.address}] Лимит отправки 0.005 – 5 ETH | ${amount} ETH`)
        } else {
            console.info(`${this.wallet.address}: Orbiter ${this.fromChain} –> ${destinationChain} | ${amount} ETH`)

            const txData = await this.getTxData(amount, destinationChain)
            const balanceEth = ethers.utils.formatEther(await this.wallet.getBalance())

            if (amount > balanceEth) {
                console.error(`[${this.wallet.address}] Недостаточный баланс`)
            } else {
                txData.gasLimit = await this.provider.estimateGas(txData)

                const signedTx = await this.wallet.signTransaction(txData)
                const txResponse = await this.provider.sendTransaction(signedTx)

                console.info(`${this.wallet.address}: Отправлено ${txResponse.hash}`)
            }
        }
    }
}