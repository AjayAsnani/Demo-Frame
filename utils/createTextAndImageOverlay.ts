import { createCanvas, registerFont } from 'canvas';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { Currency } from './enums';

export const createTextAndImageOverlay = async (currency: Currency) => {
  const apikeyToken = process.env.ETHERSCAN;
  const url = `https://api.etherscan.io/api?module=stats&action=ethsupply&apikey=${apikeyToken}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch the price');
    }
    const data = await response.json();
    const textCurrent = currency === Currency.USD ? data.result.ethusd : data.result.ethbtc;

    const canvas = createCanvas(1552, 1304);
    const ctx = canvas.getContext('2d');

    // registerFont(path.resolve('./public/fonts/Roboto-Medium.ttf'), { family: 'Roboto' });

    ctx.fillStyle = '#fdfd96';
    ctx.font = '48px Roboto';
    ctx.fillText(textCurrent, 10, 180);
    const textBuffer = canvas.toBuffer('image/png');
    const ethImagePath = path.resolve('public/eth.png');
    const ethImageBuffer = fs.readFileSync(ethImagePath);
    const newImageBuffer = await sharp(ethImageBuffer)
      .composite([{ input: textBuffer }])
      .toBuffer();
    return { textCurrent, newImageBuffer };
  } catch (error) {
    const ethImagePath = path.resolve('../public/eth.png');
    return { textCurrent: 'Error', newImageBuffer: ethImagePath };
  }
};
