# Ngx Fast Marquee

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://your-build-url.com)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](https://opensource.org/licenses/MIT)

## Description

Welcome to the 🌟 Ngx Marquee Library 🌟! This library provides an easy-to-use and customizable marquee component for your Angular applications.

<small style="font-size:12px">
Inspired by <a href="https://www.react-fast-marquee.com/" target="_blank">React-Fast-Marquee</a> <img src="https://www.react-fast-marquee.com//favicon.ico" alt="React.js Icon" width="16" height="16" style="transform: translateY(4px)">  
</small>

## 🖥️ Demo

  <a href="https://stackblitz.com/edit/stackblitz-starters-m8pkwe?file=src%2Fmain.ts" target="_blank">
    <img alt="Edit on StackBlitz" src="https://img.shields.io/badge/stackblitz-edit-blue?style=for-the-badge&logo=stackblitz">
  </a>

  <a href="https://ngx-fast-marquee.web.app/" target="_blank">
      <img alt="Web Page" src="https://img.shields.io/badge/web%20page-visit-blue?style=for-the-badge&logo=google-chrome">
  </a>

## 🛠️ Installation

Install the library using your favorite package manager:

- npm

```bash
npm i ngx-fast-marquee
```

- pnpm

```bash
pnpm i ngx-fast-marquee
```

- yarn

```bash
yarn add ngx-fast-marquee
```

- bun

```bash
bun add ngx-fast-marquee
```

Note: For Angular versions lower than v17 can be installed using the `--legacy-peer-deps` flag to avoid peer dependency errors.

## 🚀 Getting Started

Import the `NgxFastMarqueeModule` in your `AppModule`:

```typescript
import { NgxFastMarqueeModule } from "ngx-fast-marquee";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxFastMarqueeModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

Use the `ngx-fast-marquee` component in your templates:

```html
<ngx-fast-marquee>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
  <div>Item 5</div>
</ngx-fast-marquee>
```

## 📚 Documentation

In progress...🚧

Marquee Inputs:

- `speed` - The speed of the marquee in pixels per second. Also can be qualitative, `fast`, `medium`, `slow`. **Default:** `medium`.
- `direction` - The direction of the marquee (`left`, `right`, `up`, `down`).**Default:** `left`.
- `autoFill` - `true` for auto filling the space. **Default:** `true`.
- `useSystemReducedMotion` - `true` for avoid animate the marquee when the system has reduced motion. **Default:** `false`.
- `maskStartPercentage` - Start percentage of the mask. Suitable Range: 0 - 100, where 100 is the middle of the marquee. **Default:** `0`.
- `maskEndPercentage` - End percentage of the mask. Suitable Range: 0 - 100, where 100 is the middle of the marquee. **Default:** `0`.
- `maskPercentage` - Percentage of the mask. Suitable Range: 0 - 100, where 100 is the middle of the marquee (start to center and end to the center). **Default:** `0`.
- `play` - `true` for playing the marquee animation, otherwise the animation is paused. **Default:** `true`.
- `pauseOnClick` - `true` for pausing the marquee when the cursor is held down on the marquee. **Default:** `false`.
- `pauseOnHover` - `true` for Pausing the marquee when the mouse is over it. **Default:** `false`.

Marquee Outputs:

- `mounted` - Event emitted when the marquee is in the view. Emitted only once.
- `updated` - Event emitted each time the marquee is updated.

## 📄 License

This project is licensed under the MIT License.
