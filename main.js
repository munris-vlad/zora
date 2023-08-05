import fs from "fs";
import { wait, sleep, random, readWallets, writeLineToFile } from './common.js'
import axios from "axios";

fs.truncateSync('results.txt', 0);

const apiUrl = "https://mint.fun/api/mintfun/fundrop/points";

const wallets = readWallets('wallets.txt')

async function getMintfunPoints(wallet) {
    axios.get(apiUrl, {
        params: {
          address: wallet
        }
      })
      .then(function (response) {
        const result = `${wallet}: ${response.data.points}`;
        console.log(result);
        writeLineToFile('results.txt', result);
      })
      .catch(function (error) {
        console.log(error);
      })
}

for(let wallet of wallets) {
    await getMintfunPoints(wallet);
    await sleep(1.5 * 1000);
}