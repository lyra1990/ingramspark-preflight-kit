#!/usr/bin/env node
// Zero-dependency POD Full-Wrap Cover Spine & Bleed Calculator (KDP / IngramSpark / Lulu)
const CALIPERS_IN = {
  white: 0.002252,
  cream: 0.0025,
  color_standard: 0.002252,
  color_premium: 0.002347,
  groundwood: 0.0030,
};

const [trimW = '6', trimH = '9', pages = '320', stock = 'cream'] = process.argv.slice(2);
const w = Number(trimW);
const h = Number(trimH);
const p = Math.max(24, Math.round(Number(pages)));
const caliper = CALIPERS_IN[stock] ?? CALIPERS_IN.cream;
const bleed = 0.125;

const spineIn = +(p * caliper).toFixed(4);
const fullWIn = +(2 * w + spineIn + 2 * bleed).toFixed(4);
const fullHIn = +(h + 2 * bleed).toFixed(4);

console.log(JSON.stringify({
  trimIn: [w, h],
  interiorPages: p,
  paperStock: stock,
  caliperInPerPage: caliper,
  spineWidthIn: spineIn,
  spineWidthMm: +(spineIn * 25.4).toFixed(2),
  fullCoverWrapIn: [fullWIn, fullHIn],
  fullCoverWrapMm: [+(fullWIn * 25.4).toFixed(2), +(fullHIn * 25.4).toFixed(2)],
  pdfMediaBoxPt: [+(fullWIn * 72).toFixed(2), +(fullHIn * 72).toFixed(2)],
}, null, 2));
