# Measurements: refactor-core-adapter-architecture (design D8)

Bundle-size baseline and post-refactor measurements for the `20.1.0` release notes. Protocol: [design.md](design.md) D8 — [`npm run build:lib`](../../../package.json) + [`npm pack`](https://docs.npmjs.com/cli/commands/npm-pack) on [`dist/ngx-fast-marquee`](../../../dist/ngx-fast-marquee), plus a minimal standalone-consumer production build ([`tmp/bundle-consumer`](../../../tmp/bundle-consumer)) importing `NgxFastMarqueeModule` through a path mapping to the built [`dist`](../../../dist/ngx-fast-marquee).

## Pre-refactor baseline (task 1.1)

- Date: 2026-07-12
- Commit: `0bddac32bda34d21d5d0010523bd02de8107ab83`
- npm pack tarball ([`ngx-fast-marquee-0.3.0.tgz`](../../../tmp/baseline/ngx-fast-marquee-0.3.0.tgz)): 21,104 bytes
- npm pack unpacked: 100,956 bytes
- FESM2022 output ([`dist/ngx-fast-marquee/fesm2022`](../../../dist/ngx-fast-marquee/fesm2022)):

  | File | Bytes |
  | --- | ---: |
  | [`ngx-fast-marquee.mjs`](../../../dist/ngx-fast-marquee/fesm2022/ngx-fast-marquee.mjs) | 40,356 |
  | [`ngx-fast-marquee.mjs.map`](../../../dist/ngx-fast-marquee/fesm2022/ngx-fast-marquee.mjs.map) | 45,969 |

- Consumer production build (initial browser bundles; [`tmp/bundle-consumer/dist/browser`](../../../tmp/bundle-consumer/dist/browser)):

  | File | Bytes |
  | --- | ---: |
  | [`index.html`](../../../tmp/bundle-consumer/dist/browser/index.html) | 226 |
  | [`main.js`](../../../tmp/bundle-consumer/dist/browser/main.js) | 131,887 |

  JavaScript total: **131,887 bytes** (build output Initial total: 131.89 kB raw / 37.90 kB estimated transfer)

- Typings snapshot: [`tmp/baseline/index.d.ts`](../../../tmp/baseline/index.d.ts) (copied from [`dist/ngx-fast-marquee/index.d.ts`](../../../dist/ngx-fast-marquee/index.d.ts))

## Post-refactor (task 5.4)

- Date: 2026-07-12
- Commit: `0bddac32bda34d21d5d0010523bd02de8107ab83`
- npm pack tarball ([`ngx-fast-marquee-0.3.0.tgz`](../../../tmp/post-refactor/ngx-fast-marquee-0.3.0.tgz)): 20,233 bytes
- npm pack unpacked (sum of tarball contents): 82,390 bytes
- FESM2022 output ([`dist/ngx-fast-marquee/fesm2022`](../../../dist/ngx-fast-marquee/fesm2022)):

  | File | Bytes |
  | --- | ---: |
  | [`ngx-fast-marquee.mjs`](../../../dist/ngx-fast-marquee/fesm2022/ngx-fast-marquee.mjs) | 32,307 |
  | [`ngx-fast-marquee.mjs.map`](../../../dist/ngx-fast-marquee/fesm2022/ngx-fast-marquee.mjs.map) | 36,726 |

- Consumer production build (optimized [`ng build`](../../../tmp/bundle-consumer/angular.json) in [`tmp/bundle-consumer`](../../../tmp/bundle-consumer); [`tmp/bundle-consumer/dist/browser`](../../../tmp/bundle-consumer/dist/browser)):

  | File | Bytes |
  | --- | ---: |
  | [`index.html`](../../../tmp/bundle-consumer/dist/browser/index.html) | 226 |
  | [`main.js`](../../../tmp/bundle-consumer/dist/browser/main.js) | 132,973 |

  JavaScript total: **132,973 bytes** (build output Initial total: 132.97 kB raw / 38.60 kB estimated transfer)

### Delta vs pre-refactor baseline (task 1.1)

| Metric | Baseline | Post-refactor | Delta |
| --- | ---: | ---: | ---: |
| npm pack tarball | 21,104 | 20,233 | −871 |
| npm pack unpacked | 100,956 | 82,390 | −18,566 |
| FESM `.mjs` | 40,356 | 32,307 | −8,049 |
| FESM `.mjs.map` | 45,969 | 36,726 | −9,243 |
| Consumer `main.js` | 131,887 | 132,973 | +1,086 |
| Consumer `index.html` | 226 | 226 | 0 |

## FESM verification (task 5.3)

Target: [`dist/ngx-fast-marquee/fesm2022/ngx-fast-marquee.mjs`](../../../dist/ngx-fast-marquee/fesm2022/ngx-fast-marquee.mjs) after [`npm run build:lib`](../../../package.json).

Ripgrep / `Select-String` for `rxjs`, `zone.js`, `MarqueeModel`, `Renderer2`, `ngOnChanges`, `NgZone`, and `ngAfterContentChecked`: **no matches**.

Imports present: `@angular/common` (`isPlatformBrowser`) and `@angular/core` only — no RxJS or Zone.js dependency strings in the bundle.
