import { APP_BOOTSTRAP_LISTENER, Injectable } from '@angular/core';
import { ReplaySubject, first, of, type Observable } from 'rxjs';

export abstract class InitializationStrategy {
  abstract when(): Observable<void>;
}

@Injectable({
  providedIn: 'root',
})
export class AfterAppInit implements InitializationStrategy {
  #initialized = new ReplaySubject<void>(1);

  public when(): Observable<void> {
    return this.#initialized.pipe(first());
  }

  public markAsInitialized(): void {
    this.#initialized.next();
  }
}

export const afterAppInitProvider = {
  provide: APP_BOOTSTRAP_LISTENER,
  multi: true,
  useFactory: (afterInit: AfterAppInit) => () => afterInit.markAsInitialized(),
  deps: [AfterAppInit],
};

@Injectable({
  providedIn: 'root',
})
export class BeforeAppInit implements InitializationStrategy {
  public when(): Observable<void> {
    return of(void 0);
  }
}
