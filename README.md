# POD & IngramSpark PDF/X-1a Preflight Test Suite

A zero-dependency, MIT-licensed synthetic PDF test suite and byte-level checklist for testing **ISO 15930-1 (`PDF/X-1a:2001`)** print-on-demand (POD) preflight pipelines (IngramSpark, Lightning Source, DriveThruRPG, Lulu, and Amazon KDP).

## What's Inside

Running `node generate-test-pdfs.mjs` deterministically builds 4 tiny, human-readable PDF test fixtures in `./samples/`:

| Fixture | Simulated Print Defect | Expected `PDF/X-1a:2001` Preflight Result |
| :--- | :--- | :--- |
| `01-clean-cmyk-100k.pdf` | Clean `DeviceCMYK` stream with `0 0 0 1 k` (`100% K`) body text and `TrimBox` / `BleedBox` (missing ICC OutputIntent stream only) | Passes geometry, color-space, and transparency checks |
| `02-rgb-rich-black-over-240-tac.pdf` | Unseparated `DeviceRGB` (`0 0 0 rg`) + heavy 4-color `0.85 0.80 0.78 0.90 k` (`333% TAC`) block | **FAIL**: Forbidden `DeviceRGB` + exceeds IngramSpark `240% TAC` ceiling |
| `03-live-transparency-ca.pdf` | Page `/Group /S /Transparency` + `ExtGState` with `/ca 0.5 /CA 0.5` | **FAIL**: Forbidden PDF 1.4 live transparency |
| `04-missing-trimbox-hyperlink.pdf` | `MediaBox` only (no `TrimBox`/`BleedBox`) + clickable `/Subtype /Link` annotation | **FAIL**: Missing trim geometry + forbidden interactive `/Link` annotation |

## Quick Start

```bash
node generate-test-pdfs.mjs
```

## Byte-Level `PDF/X-1a:2001` (ISO 15930-1) POD Checklist

1. **Identification Keys (`Info` Dict)**:
   - `/GTS_PDFXVersion (PDF/X-1:2001)` and `/GTS_PDFXConformance (PDF/X-1a:2001)`
   - `/Title` non-empty; `/Trapped /False` (or `/True` — `/Unknown` is non-compliant)
2. **OutputIntent (`Catalog`)**:
   - `/OutputIntents` array containing `/S /GTS_PDFX` with an embedded 4-channel (`/N 4`) CMYK ICC profile (`DestOutputProfile`) or registered `OutputConditionIdentifier` (`CGATS TR 001`, `FOGRA39`, `Japan Color 2001 Coated`).
3. **Color Spaces**:
   - Strictly `DeviceCMYK`, `DeviceGray`, or compliant `/Separation` / `/DeviceN` / CMYK-backed `/Indexed`.
   - Zero `DeviceRGB`, `CalRGB`, `Lab`, or `sRGB` `ICCBased` (`/N 3`) streams.
4. **Total Area Coverage (`TAC = C + M + Y + K`)**:
   - **IngramSpark / Lightning Source / DriveThruRPG**: `<= 240%`
   - **Lulu / Amazon KDP**: `<= 270%`–`300%`
   - **Commercial Coated Offset (`FOGRA39`)**: `<= 300%`
   - **Body Text**: Lock dark neutral text (`0 0 0 rg`) to single-plate `0 0 0 1 k` (`100% K`) so small serif type never misregisters across 4 plates.
5. **Zero Live Transparency**:
   - No `/SMask` dictionaries, no `ExtGState` with `ca < 1.0` or `CA < 1.0`, no non-`Normal` `/BM` blend modes, and no `/Group /S /Transparency`.
6. **Page Box Geometry & Fonts**:
   - Every page defines `/MediaBox` plus `/TrimBox` (or `/ArtBox`, never both simultaneously), with `0.125"` (`9 pt`) `/BleedBox` margin on full-bleed covers.
   - 100% of referenced fonts embed their glyph streams (`/FontFile`, `/FontFile2`, `/FontFile3`).
   - Zero `/Subtype /Link` annotations, `/JavaScript` actions, `/Encrypt` trailers, or LZW-compressed streams.

## POD Cover Spine & Full-Wrap Bleed Formula (`node pod-spine-calculator.mjs`)

Most IngramSpark and Amazon KDP cover dimension rejections happen because changing interior page count or switching from White (`0.002252"/page`) to Cream (`0.0025"/page`) shifts total full-wrap cover width:

```text
Spine Width (in)      = Interior Pages × Paper Stock Caliper
Full Cover Width (in) = (2 × Trim Width) + Spine Width + (2 × 0.125" Bleed)
Full Cover Height(in) = Trim Height + (2 × 0.125" Bleed)
```

Run `node pod-spine-calculator.mjs 6 9 320 cream` to print exact KDP & IngramSpark full-wrap dimensions in inches, millimeters, and PDF points (`72 pt/in`).

## Free Browser Inspector & Zero-Content POD Rejection Solver

To test these fixtures visually with an 18-point ISO 15930-1 scanner, interactive pixel-level 240% CMYK TAC heatmap, and **Zero-Content POD Rejection & Cover Spine Auto-Solver** directly in your browser (`0 PDF bytes` uploaded):
- **[PrintPDFX — Free Local PDF/X-1a Preflight, 240% TAC Map & POD Rejection Solver](https://printpdfx.com/)**

## License

MIT
