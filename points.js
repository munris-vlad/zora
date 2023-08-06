import fs from "fs";
import { wait, sleep, random, readWallets, writeLineToFile } from './common.js'
import axios from "axios";

fs.truncateSync('results.txt', 0);

const apiUrl = "https://mint.fun/api/mintfun/fundrop/pass";

const wallets = readWallets('wallets.txt')

let totalPoints = 0;

async function getMintfunPoints(wallet) {
    axios.get(apiUrl, {
        params: {
          address: wallet
        }
    }).then(function (response) {
        totalPoints += response.data.points;
        let points = response.data.points;
        let streak = response.data.streak;
        let line = `${wallet}: ${points} | Streak: ${streak}`;
        console.log(line);
        writeLineToFile('results.txt', line);
    }).catch(function (error) {
        console.log(`${wallet}: ${error.response.data.message}`);
    });
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