#!/usr/bin/env node
/**
 * Screenshot diff tool: compares localhost docs against production (dndkit.com).
 *
 * Takes full-page screenshots of both, resizes to match, runs pixelmatch,
 * and outputs a diff percentage + diff image.
 *
 * Usage:
 *   node scripts/diff-screenshots.mjs [path] [--threshold N]
 *   node scripts/diff-screenshots.mjs /overview
 *   node scripts/diff-screenshots.mjs /react/quickstart --threshold 0.3
 *
 * Outputs:
 *   scripts/diff-output/prod.png    — production screenshot
 *   scripts/diff-output/local.png   — local screenshot
 *   scripts/diff-output/diff.png    — pixel diff overlay (red = different)
 *
 * Exit code 0 if diff < threshold (default 0.5%), 1 otherwise.
 */

import puppeteer from 'puppeteer';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';

const PROD_BASE = 'https://dndkit.com';
const LOCAL_BASE = 'http://localhost:4321';
const VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 1 };
const OUTPUT_DIR = resolve('./scripts/diff-output');

// Parse args
const args = process.argv.slice(2);
let pagePath = '/overview';
let threshold = 0.5;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--threshold' && args[i + 1]) {
    threshold = parseFloat(args[i + 1]);
    i++;
  } else if (!args[i].startsWith('--')) {
    pagePath = args[i].startsWith('/') ? args[i] : `/${args[i]}`;
  }
}

async function takeScreenshot(browser, url, name) {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 2000));

  const path = join(OUTPUT_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: true, type: 'png' });
  await page.close();
  console.log(`  ${name}: ${path}`);
  return path;
}

function loadPNG(filePath) {
  return PNG.sync.read(readFileSync(filePath));
}

function resizeToMatch(imgA, imgB) {
  // Pad the smaller image with white to match the larger dimensions
  const w = Math.max(imgA.width, imgB.width);
  const h = Math.max(imgA.height, imgB.height);

  function pad(img) {
    if (img.width === w && img.height === h) return img;
    const padded = new PNG({ width: w, height: h });
    // Fill with white
    for (let i = 0; i < padded.data.length; i += 4) {
      padded.data[i] = 255;
      padded.data[i + 1] = 255;
      padded.data[i + 2] = 255;
      padded.data[i + 3] = 255;
    }
    // Copy original pixels
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const srcIdx = (y * img.width + x) * 4;
        const dstIdx = (y * w + x) * 4;
        padded.data[dstIdx] = img.data[srcIdx];
        padded.data[dstIdx + 1] = img.data[srcIdx + 1];
        padded.data[dstIdx + 2] = img.data[srcIdx + 2];
        padded.data[dstIdx + 3] = img.data[srcIdx + 3];
      }
    }
    return padded;
  }

  return [pad(imgA), pad(imgB)];
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`\n📸 Screenshot Diff: ${pagePath}`);
  console.log(`   Production: ${PROD_BASE}${pagePath}`);
  console.log(`   Local:      ${LOCAL_BASE}${pagePath}`);
  console.log(`   Threshold:  ${threshold}%\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    console.log('Taking screenshots...');
    const [prodPath, localPath] = await Promise.all([
      takeScreenshot(browser, `${PROD_BASE}${pagePath}`, 'prod'),
      takeScreenshot(browser, `${LOCAL_BASE}${pagePath}`, 'local'),
    ]);

    console.log('\nComparing...');
    let prodImg = loadPNG(prodPath);
    let localImg = loadPNG(localPath);

    console.log(`  Production: ${prodImg.width}x${prodImg.height}`);
    console.log(`  Local:      ${localImg.width}x${localImg.height}`);

    // Resize to match
    [prodImg, localImg] = resizeToMatch(prodImg, localImg);
    const { width, height } = prodImg;
    console.log(`  Compared:   ${width}x${height}`);

    // Run pixelmatch
    const diff = new PNG({ width, height });
    const numDiffPixels = pixelmatch(
      prodImg.data,
      localImg.data,
      diff.data,
      width,
      height,
      { threshold: 0.1 } // per-pixel color sensitivity
    );

    const totalPixels = width * height;
    const diffPercent = ((numDiffPixels / totalPixels) * 100).toFixed(3);

    // Save diff image
    const diffPath = join(OUTPUT_DIR, 'diff.png');
    writeFileSync(diffPath, PNG.sync.write(diff));

    console.log(`\n  Diff pixels: ${numDiffPixels.toLocaleString()} / ${totalPixels.toLocaleString()}`);
    console.log(`  Diff:        ${diffPercent}%`);
    console.log(`  Diff image:  ${diffPath}`);

    if (parseFloat(diffPercent) < threshold) {
      console.log(`\n  ✅ PASS — ${diffPercent}% < ${threshold}% threshold\n`);
      process.exit(0);
    } else {
      console.log(`\n  ❌ FAIL — ${diffPercent}% >= ${threshold}% threshold\n`);
      process.exit(1);
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
