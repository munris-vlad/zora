import axios from "axios"
import fs from "fs"

const apiUrl = "https://mint.fun/api/mintfun/fundrop/pass"
const mintCheckApiUrl = "https://mint.fun/api/mintfun/contract/"
const submitTxApiUrl = "https://mint.fun/api/mintfun/submit-tx"

export async function checkPass(address) {
    try {
        const response = await axios.get(apiUrl, {
            params: {
                address: address
            }
        })

        return true
    } catch (error) {
        return false
    }
}

export async function isMinted(address, contract, network) {
    try {
        const response = await axios.get(mintCheckApiUrl+`${network}:${contract}/minted`, {
            params: {
                address: address
            }
        })
        const count = response.data.count

        return count > 0
    } catch (error) {
        return 0
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
      .then(function (response) {
      })
      .catch(function (error) {
        console.log(error)
      })
}