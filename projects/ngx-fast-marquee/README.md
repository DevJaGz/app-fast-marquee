# Ngx Fast Marquee

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://your-build-url.com)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](https://opensource.org/licenses/MIT)

## Description

Want to bring your website to life with dynamic, eye-catching marquees?

Look no further! The ✨ **Ngx Fast Marquee** ✨ is a lightweight component that can bring to life your Angular applications through fast and user-friendly marquee animations.

See the Demo section below for a live example!

> 📦 **This package is built from the `12.x` branch** (Patchable line, Angular 12–19). For Angular 20+, install from the `master`/`develop` branch build instead. Both lines expose the identical template-level API documented below — see [Angular Compatibility](#angular-compatibility).

## 🖥️ Demo

See **Ngx Fast Marquee** in action!

- 📱 <a href="https://ngx-fast-marquee.web.app/" target="_blank">Web Demo</a>
- 🎮 <a href="https://stackblitz.com/edit/stackblitz-starters-m8pkwe?file=src%2Fmain.ts" target="_blank">StackBlitz</a>

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

### Angular Compatibility

| Angular Version    | Library Version | Line               |
| ------------------- | ---------------- | ------------------- |
| `>=20.0.0 <23.0.0`  | `20.x`           | Active               |
| `>=12.0.0 <20.0.0`  | `12.0.0`         | Patchable (this build) |

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

Marquee Inputs:

| Name                      | Type    | Default  | Description                                                                                                      |
| -------------------------- | ------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `speed`                   | number  | `medium` | The speed of the marquee in pixels per second. Also can be qualitative, `fast`, `medium`, `slow`.                 |
| `direction`               | string  | `left`   | The direction of the marquee (`left`, `right`, `up`, `down`).                                                     |
| `autoFill`                | boolean | `true`   | `true` for auto filling the space.                                                                                |
| `useSystemReducedMotion`  | boolean | `false`  | `true` for avoid animate the marquee when the system has reduced motion.                                          |
| `maskStartPercentage`     | number  | `0`      | Start percentage of the mask. Suitable Range: 0 - 100, where 100 is the middle of the marquee.                    |
| `maskEndPercentage`       | number  | `0`      | End percentage of the mask. Suitable Range: 0 - 100, where 100 is the middle of the marquee.                      |
| `maskPercentage`          | number  | `0`      | Percentage of the mask. Suitable Range: 0 - 100, where 100 is the middle of the marquee (start to center and end to the center). |
| `play`                    | boolean | `true`   | `true` for playing the marquee animation, otherwise the animation is paused.                                      |
| `pauseOnClick`            | boolean | `false`  | `true` for pausing the marquee when the cursor is held down on the marquee.                                       |
| `pauseOnHover`            | boolean | `false`  | `true` for Pausing the marquee when the mouse is over it.                                                         |

Marquee Outputs:

| Name      | Description                                                |
| --------- | ------------------------------------------------------------ |
| `mounted` | Event emitted when the marquee is in the view. Emitted only once. |
| `updated` | Event emitted each time the marquee is updated.               |

## 📄 License

This project is licensed under the MIT License.
