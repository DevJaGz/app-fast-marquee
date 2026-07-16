<div align="center">

# ✨ ngx-fast-marquee

**A lightweight Angular marquee component — smooth, accessible, and dependency-free.**

[![npm version](https://img.shields.io/npm/v/ngx-fast-marquee/v12.svg?color=dd0031&label=npm%20%40v12)](https://www.npmjs.com/package/ngx-fast-marquee/v/12.0.0)
[![npm downloads](https://img.shields.io/npm/dm/ngx-fast-marquee.svg?color=dd0031)](https://www.npmjs.com/package/ngx-fast-marquee)
[![Angular](https://img.shields.io/badge/Angular-12--19-dd0031?logo=angular&logoColor=white)](#angular-compatibility)
[![License: MIT](https://img.shields.io/npm/l/ngx-fast-marquee.svg?color=blue)](./LICENSE)

[Live Demo](https://ngx-fast-marquee.web.app/) · [StackBlitz Playground](https://stackblitz.com/edit/stackblitz-starters-m8pkwe?file=src%2Fmain.ts) · [Report an Issue](https://github.com/DevJaGz/app-fast-marquee/issues)

</div>

---

Want to bring your website to life with dynamic, eye-catching marquees? **ngx-fast-marquee** is a lightweight component that adds fast, smooth, user-friendly marquee animations to your Angular application — no external dependencies.

> 📦 **This package is built from the `12.x` branch** (Maintenance line, Angular 12–19: stable, critical fixes only). For Angular 20+, install the latest `ngx-fast-marquee` instead. Both lines expose the identical template-level API documented below — see [Angular Compatibility](#angular-compatibility).

## Contents

- [Features](#-features)
- [Demo](#-demo)
- [Installation](#-installation)
- [Angular Compatibility](#angular-compatibility)
- [Getting Started](#-getting-started)
- [Documentation](#-documentation)
- [License](#-license)

## ✨ Features

- 🪶 **Lightweight** — no runtime dependencies beyond `tslib`.
- 🎯 **Precise control** — direction, speed, pausing, and edge masking, all tunable per instance.
- ♿ **Accessible by default** — honors `prefers-reduced-motion` via `useSystemReducedMotion`.
- 🧱 **NgModule-first** — built for classic decorator-based Angular 12–19 applications.
- 🍏 **Safari/iOS-safe** — ships a guard for a known Safari `requestIdleCallback` defect (see below).

## 🖥️ Demo

See **ngx-fast-marquee** in action!

- 📱 [Web Demo](https://ngx-fast-marquee.web.app/)
- 🎮 [StackBlitz](https://stackblitz.com/edit/stackblitz-starters-m8pkwe?file=src%2Fmain.ts)

## 🛠️ Installation

Install the library using your favorite package manager:

| Package manager | Command                        |
| --------------- | ------------------------------ |
| npm             | `npm i ngx-fast-marquee@12`    |
| pnpm            | `pnpm i ngx-fast-marquee@12`   |
| yarn            | `yarn add ngx-fast-marquee@12` |
| bun             | `bun add ngx-fast-marquee@12`  |

### Angular Compatibility

| Angular Version | Install                     | Status                                                                  |
| --------------- | --------------------------- | ----------------------------------------------------------------------- |
| `20 – 22`       | `npm i ngx-fast-marquee`    | **Active** (`20.x` line) — recommended, new features land here          |
| `12 – 19`       | `npm i ngx-fast-marquee@12` | **Maintenance** (`12.x` line, this build) — stable, critical fixes only |
| any             | `0.x` releases              | **Deprecated** — do not use                                             |

Each line's major version equals its Angular floor. Both lines expose the identical template-level binding surface (selector, inputs, outputs, `NgxFastMarqueeModule`, `provideFastMarquee()`) — a template written against one compiles unmodified against the other. The **class instance surface is out of contract**: this build's `NgxFastMarqueeComponent` uses `@Input()`/`@Output()` decorators and zone-based change detection (Angular 12 has no standalone components or signals); the `20.x` line uses signal `input()`/`output()` and is zoneless. Code that only binds the component through its template is unaffected; code that reaches into the component instance directly (e.g. via `@ViewChild`) is not portable between lines.

## 🚀 Getting Started

### NgModule applications

Import `NgxFastMarqueeModule` in your `AppModule`:

```typescript
import { NgxFastMarqueeModule } from 'ngx-fast-marquee';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxFastMarqueeModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

No additional setup is needed: `NgxFastMarqueeModule` always registers the library's idle-callback compatibility guard automatically (see the Safari/iOS note below) — there is no opt-out and no separate provider call required for `NgModule` consumers on this line.

### Without the module

If you need the raw `NgxFastMarqueeComponent` without `NgxFastMarqueeModule` (for example, to control the idle-callback guard's registration yourself), declare it directly in your own module and call `provideFastMarquee()` in your root module's `providers`:

```typescript
import { NgModule } from '@angular/core';
import { NgxFastMarqueeComponent, provideFastMarquee } from 'ngx-fast-marquee';

@NgModule({
  declarations: [AppComponent, NgxFastMarqueeComponent],
  providers: [provideFastMarquee()],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

> ⚠️ **Safari/iOS idle-callback note**: some Safari/iOS builds expose `requestIdleCallback` without `cancelIdleCallback`. This library ships a bootstrap-time guard that patches the missing side — see [issue #5](https://github.com/DevJaGz/app-fast-marquee/issues/5) and the upstream bug [angular/angular#53721](https://github.com/angular/angular/issues/53721). Importing `NgxFastMarqueeModule` in your root module registers the guard automatically; only the "declare the component directly" pattern above requires calling `provideFastMarquee()` yourself.

### Usage

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

#### Inputs

| Name                     | Type                                     | Default  | Description                                                                                                 |
| ------------------------ | ---------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `speed`                  | `number \| 'fast' \| 'medium' \| 'slow'` | `medium` | Speed of the marquee. Accepts pixels per second, or a qualitative value.                                    |
| `direction`              | `'left' \| 'right' \| 'up' \| 'down'`    | `left`   | Direction the marquee scrolls.                                                                              |
| `autoFill`               | `boolean`                                | `true`   | Automatically duplicate content to fill the available space.                                                |
| `useSystemReducedMotion` | `boolean`                                | `false`  | Disable the marquee animation when the OS has reduced motion enabled.                                       |
| `maskStartPercentage`    | `number`                                 | `0`      | Fade percentage at the start edge. Range: `0`–`100`, where `100` reaches the middle of the marquee.         |
| `maskEndPercentage`      | `number`                                 | `0`      | Fade percentage at the end edge. Range: `0`–`100`, where `100` reaches the middle of the marquee.           |
| `maskPercentage`         | `number`                                 | `0`      | Shorthand to set both edges at once. Range: `0`–`100`, where `100` reaches the middle from both directions. |
| `play`                   | `boolean`                                | `true`   | Play or pause the marquee animation.                                                                        |
| `pauseOnClick`           | `boolean`                                | `false`  | Pause the marquee while the mouse button is held down over it.                                              |
| `pauseOnHover`           | `boolean`                                | `false`  | Pause the marquee while the mouse is hovering over it.                                                      |

#### Outputs

| Name      | Description                                             |
| --------- | ------------------------------------------------------- |
| `mounted` | Emitted once, the first time the marquee is in view.    |
| `updated` | Emitted every time the marquee re-measures and updates. |

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
