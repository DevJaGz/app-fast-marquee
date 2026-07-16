<div align="center">

# ✨ ngx-fast-marquee

**A lightweight, zoneless-ready Angular marquee component — smooth, accessible, and dependency-free.**

[![npm version](https://img.shields.io/npm/v/ngx-fast-marquee.svg?color=dd0031&label=npm)](https://www.npmjs.com/package/ngx-fast-marquee)
[![npm downloads](https://img.shields.io/npm/dm/ngx-fast-marquee.svg?color=dd0031)](https://www.npmjs.com/package/ngx-fast-marquee)
[![Angular](https://img.shields.io/badge/Angular-20--22-dd0031?logo=angular&logoColor=white)](#angular-compatibility)
[![License: MIT](https://img.shields.io/npm/l/ngx-fast-marquee.svg?color=blue)](./LICENSE)

[Live Demo](https://ngx-fast-marquee.web.app/) · [StackBlitz Playground](https://stackblitz.com/edit/stackblitz-starters-5zvdjumb?file=src%2Fmain.ts) · [Report an Issue](https://github.com/DevJaGz/app-fast-marquee/issues)

</div>

---

Want to bring your website to life with dynamic, eye-catching marquees? **ngx-fast-marquee** is a lightweight component that adds fast, smooth, user-friendly marquee animations to your Angular application — no external dependencies, fully signal-driven, and zoneless by design.

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
- ⚡ **Zoneless-native** — built with signal `input()`/`output()` and `provideZonelessChangeDetection()` in mind.
- 🎯 **Precise control** — direction, speed, pausing, and edge masking, all tunable per instance.
- ♿ **Accessible by default** — honors `prefers-reduced-motion` via `useSystemReducedMotion`.
- 🧩 **Standalone or NgModule** — works with either application style out of the box.
- 🍏 **Safari/iOS-safe** — ships a guard for a known Safari `requestIdleCallback` defect (see below).

## 🖥️ Demo

See **ngx-fast-marquee** in action!

- 📱 [Web Demo](https://ngx-fast-marquee.web.app/)
- 🎮 [StackBlitz](https://stackblitz.com/edit/stackblitz-starters-5zvdjumb?file=src%2Fmain.ts)

## 🛠️ Installation

### Quick install (recommended)

Run `ng add ngx-fast-marquee` in your Angular workspace. This installs the package as a dependency and automatically registers `provideFastMarquee()` in your app's root providers — the guard required for `@defer` usage (see the Safari/iOS note below).

```bash
ng add ngx-fast-marquee
```

### Manual install

If you'd rather install manually (or `ng add` can't detect your workspace shape), install the package with your favorite package manager and follow the [Getting Started](#-getting-started) section below to register `provideFastMarquee()` yourself.

| Package manager | Command                     |
| --------------- | --------------------------- |
| npm             | `npm i ngx-fast-marquee`    |
| pnpm            | `pnpm i ngx-fast-marquee`   |
| yarn            | `yarn add ngx-fast-marquee` |
| bun             | `bun add ngx-fast-marquee`  |

### Angular Compatibility

| Angular Version | Install                     | Status                                                                     |
| --------------- | --------------------------- | -------------------------------------------------------------------------- |
| `20 – 22`       | `npm i ngx-fast-marquee`    | **Active** (`20.x` line, this build) — recommended, new features land here |
| `12 – 19`       | `npm i ngx-fast-marquee@12` | **Maintenance** (`12.x` line) — stable, critical fixes only                |
| any             | `0.x` releases              | **Deprecated** — do not use                                                |

Each line's major version equals its Angular floor. Both lines expose the identical template-level binding surface (selector, inputs, outputs, `NgxFastMarqueeModule`, `provideFastMarquee()`) — a template written against one compiles unmodified against the other. The **class instance surface is out of contract**: this build (`20.x` line) uses signal `input()`/`output()` and zoneless change detection; the `12.x` line uses `@Input()`/`@Output()` decorators and zone-based change detection. Code that only binds the component through its template is unaffected; code that reaches into the component instance directly (e.g. via `viewChild`) is not portable between lines.

## 🚀 Getting Started

### NgModule applications

Import the `NgxFastMarqueeModule` in your `AppModule`:

```typescript
import { NgxFastMarqueeModule } from 'ngx-fast-marquee';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxFastMarqueeModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

No additional setup is needed: `NgxFastMarqueeModule` automatically registers the library's idle-callback compatibility guard at bootstrap (see the Safari/iOS note below).

### Standalone applications

Add `provideFastMarquee()` to your `bootstrapApplication()` providers, and import `NgxFastMarqueeModule` in the component that renders the marquee:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideFastMarquee } from 'ngx-fast-marquee';

bootstrapApplication(AppComponent, {
  providers: [provideFastMarquee()],
});
```

```typescript
import { Component } from '@angular/core';
import { NgxFastMarqueeModule } from 'ngx-fast-marquee';

@Component({
  standalone: true,
  imports: [NgxFastMarqueeModule],
  templateUrl: './app.component.html',
})
export class AppComponent {}
```

> ⚠️ **Required for `@defer` usage (Safari/iOS)**: if `<ngx-fast-marquee>` is rendered inside a `@defer` block (e.g. `@defer (on idle)`), `provideFastMarquee()` **must** be registered in your `bootstrapApplication()` providers. Some Safari/iOS builds expose `requestIdleCallback` without `cancelIdleCallback`, and Angular's `@defer` idle scheduler crashes in that environment — see [issue #5](https://github.com/DevJaGz/app-fast-marquee/issues/5) and the upstream bug [angular/angular#53721](https://github.com/angular/angular/issues/53721) — **before** the deferred chunk containing the marquee can load, so only a bootstrap-time provider can prevent it. The same applies if a lazy-loaded module imports `NgxFastMarqueeModule`: register `provideFastMarquee()` at the root bootstrap.

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
