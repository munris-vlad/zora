import fs from "fs";
import { wait, sleep, random, readWallets, writeLineToFile } from './common.js'
import axios from "axios";

fs.truncateSync('results.txt', 0);

const apiUrl = "https://mint.fun/api/mintfun/fundrop/points";

const wallets = readWallets('wallets.txt')

let totalPoints = 0;

async function getMintfunPoints(wallet) {

    axios.get(apiUrl, {
        params: {
          address: wallet
        }
      })
      .then(function (response) {
          const points = response.data.points
          const result = `${wallet}: ${points}`;
          totalPoints += points;
          console.log(result);
          writeLineToFile('results.txt', result);
      })
      .catch(function (error) {
          console.log(`${wallet}: ${error.response.data.message}`);
      })
}

let iterations = wallets.length;
for (let wallet of wallets) {
    await getMintfunPoints(wallet);
    await sleep(1.5 * 1000);

    if (!--iterations) {
        console.log(`Total: ${totalPoints}`);
        writeLineToFile('results.txt', `Total: ${totalPoints}`);
    }
}