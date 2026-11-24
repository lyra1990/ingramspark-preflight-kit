#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'samples');
fs.mkdirSync(outDir, { recursive: true });

function buildPdf(objects, infoExtra = '') {
  let out = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(out, 'binary'));
    out += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const infoId = objects.length + 1;
  offsets.push(Buffer.byteLength(out, 'binary'));
  out += `${infoId} 0 obj\n<< /Title (POD Preflight Test Fixture) /Producer (pod-pdfx-test-suite) ${infoExtra} >>\nendobj\n`;

  const xrefOffset = Buffer.byteLength(out, 'binary');
  out += `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) {
    out += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  out += `trailer\n<< /Size ${offsets.length} /Root 1 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(out, 'binary');
}

function streamObj(body) {
  return `<< /Length ${Buffer.byteLength(body, 'binary')} >>\nstream\n${body}\nendstream`;
}

// 1. Clean CMYK + 100% K black + TrimBox/BleedBox
fs.writeFileSync(
  path.join(outDir, '01-clean-cmyk-100k.pdf'),
  buildPdf(
    [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 450 666] /BleedBox [0 0 450 666] /TrimBox [9 9 441 657] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      streamObj('q 0.1 0.05 0 0 k 36 520 200 80 re f 0 0 0 1 k BT /F1 14 Tf 48 480 Td (Clean 100% K Body Text & <=240% CMYK) Tj ET Q'),
    ],
    '/Trapped /False'
  )
);

// 2. Forbidden RGB + 333% TAC (>240% IngramSpark cap)
fs.writeFileSync(
  path.join(outDir, '02-rgb-rich-black-over-240-tac.pdf'),
  buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 450 666] /TrimBox [9 9 441 657] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    streamObj('q 0.85 0.80 0.78 0.90 k 36 480 280 120 re f 0.9 0.1 0.1 rg 36 380 180 60 re f 0 0 0 rg BT /F1 13 Tf 48 340 Td (RGB Black + 333% TAC Violator) Tj ET Q'),
  ])
);

// 3. Forbidden Live Transparency (ca < 1 + /Group /Transparency)
fs.writeFileSync(
  path.join(outDir, '03-live-transparency-ca.pdf'),
  buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 450 666] /TrimBox [9 9 441 657] /Group << /Type /Group /S /Transparency /CS /DeviceCMYK >> /Resources << /ExtGState << /GS1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /ExtGState /ca 0.5 /CA 0.5 /BM /Multiply >>',
    streamObj('q /GS1 gs 0.6 0.1 0.0 0.1 k 60 440 240 140 re f Q'),
  ])
);

// 4. Missing TrimBox + Forbidden Hyperlink Annotation
fs.writeFileSync(
  path.join(outDir, '04-missing-trimbox-hyperlink.pdf'),
  buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 432 648] /Annots [4 0 R] /Contents 5 0 R >>',
    '<< /Type /Annot /Subtype /Link /Rect [48 500 260 530] /Border [0 0 0] /A << /S /URI /URI (https://example.com) >> >>',
    streamObj('q 0 0 0 1 k 48 505 200 2 re f Q'),
  ])
);

console.log('Generated 4 POD PDF/X-1a test fixtures in ./samples/');
