import { Injectable } from '@angular/core';
import { storeRehydrateAction } from '@ngrx-addons/persist-state';
import { storeSyncAction } from '@ngrx-addons/sync-state';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs';

@Injectable()
export class ProductsEffects {
  public rehydrate = createEffect(
    () => {
      return this.actions.pipe(
        ofType(storeRehydrateAction),
        tap((action) => {
          console.log('rehydrate', action);
        }),
      );
    },
    { dispatch: false },
  );

  public sync = createEffect(
    () => {
      return this.actions.pipe(
        ofType(storeSyncAction),
        tap((action) => {
          console.log('sync', action);
        }),
      );
    },
    { dispatch: false },
  );

  constructor(private readonly actions: Actions) {}
}
