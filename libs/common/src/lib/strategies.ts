import type { OnDestroy } from '@angular/core';
import { APP_BOOTSTRAP_LISTENER, inject, Injectable } from '@angular/core';
import { first, of, ReplaySubject, type Observable } from 'rxjs';

/**
 * Interface for strategies implementing way of initialization
 * of the state.
 */
export abstract class InitializationStrategy {
  /**
   * Returns observable that resolves when initialization is done.
   */
  public abstract when(): Observable<void>;
}

/**
 * Strategy initializing state after whole angular application is initialized.
 */
@Injectable({
  providedIn: 'root',
})
export class AfterAppInit implements InitializationStrategy, OnDestroy {
  readonly #initialized = new ReplaySubject<void>(1);

  public when(): Observable<void> {
    return this.#initialized.pipe(first());
  }

  /**
   * Mark strategy as initialized. Meant to be called once whole angular
   * application is initialized.
   */
  public markAsInitialized(): void {
    this.#initialized.next();
  }

  /**
   * Cleanup resources.
   */
  public ngOnDestroy(): void {
    this.#initialized.complete();
  }
}

export const afterAppInitProvider = {
  provide: APP_BOOTSTRAP_LISTENER,
  multi: true,
  useFactory:
    (afterInit: AfterAppInit = inject(AfterAppInit)) =>
    (): void => {
      afterInit.markAsInitialized();
    },
};

/**
 * Strategy initializing state as soon as it possible, before angular
 * application is initialized.
 */
@Injectable({
  providedIn: 'root',
})
export class BeforeAppInit implements InitializationStrategy {
  public when(): Observable<void> {
    return of(void 0);
  }
}
