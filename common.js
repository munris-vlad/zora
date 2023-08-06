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