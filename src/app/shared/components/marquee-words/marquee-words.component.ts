import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  WritableSignal,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxFastMarqueeModule } from '@ngx-fast-marquee';
import { WordsPool } from '@core';

@Component({
  selector: 'app-marquee-words',
  standalone: true,
  imports: [CommonModule, NgxFastMarqueeModule],
  templateUrl: './marquee-words.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarqueeWordsComponent implements OnInit {
  /**
   *  Words to be displayed in the marquee.
   */
  words: WritableSignal<string[]> = signal([]);

  /**
   * True if the words have been changed.
   */
  hasNewWords: WritableSignal<boolean> = signal(false);

  ngOnInit(): void {
    this._handleWordsReplacing();
  }

  /**
   *  Interval in milliseconds to change the words.
   */
  private readonly _WORDS_INTERVAL = 15_000;

  /**
   *  Last pool key used to get random words.
   */
  private _lastPoolKey = '';

  /**
   * Pool of words to select from.
   */
  private _wordsPool: Record<string, string[]> = WordsPool;

  /**
   *  Keys of the words pool.
   */
  private get _poolKeys(): string[] {
    return Object.keys(this._wordsPool);
  }

  /**
   * Gets random words from the pool.
   * @returns Random words.
   */
  private _getRandomWordsFromPool(): string[] {
    const poolKeysFiltered = this._poolKeys.filter(
      (poolKey) => poolKey !== this._lastPoolKey,
    );
    const randomPoolIndex = Math.floor(Math.random() * poolKeysFiltered.length);
    const randomPoolKey = poolKeysFiltered[randomPoolIndex];
    this._lastPoolKey = randomPoolKey;
    return this._wordsPool[randomPoolKey];
  }

  /**
   *  Sets the words to be displayed in the marquee.
   */
  private setWords(): void {
    this.words.set(this._getRandomWordsFromPool());
  }

  /**
   * Handles the words replacing.
   */
  private _handleWordsReplacing(): void {
    this.setWords();
    this._runInterval();
  }

  /**
   * Runs the interval to change the words.
   */
  private _runInterval(): void {
    setInterval(() => {
      this.setWords();
      this._toggleReplacingAnimationWithTimeout();
    }, this._WORDS_INTERVAL);
  }

  /**
   * Toggle the animation to replace the words with a timeout.
   */
  private _toggleReplacingAnimationWithTimeout(): void {
    this.hasNewWords.set(true);
    setTimeout(() => {
      this.hasNewWords.set(false);
    }, this._WORDS_INTERVAL / 2);
  }
}
