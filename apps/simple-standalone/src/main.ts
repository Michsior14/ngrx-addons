import {
  enableProdMode,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import {
  localStorageStrategy,
  providePersistStore,
} from '@ngrx-addons/persist-state';
import { provideSyncStore } from '@ngrx-addons/sync-state';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { AppComponent } from './app/app.component';
import { ProductsEffects } from './app/products/products.effects';
import type { ProductsState } from './app/products/products.reducer';
import { productFeature } from './app/products/products.reducer';
import { environment } from './environments/environment';

const appState = {
  [productFeature.name]: productFeature.reducer,
};

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    provideStore(appState, {
      metaReducers: !environment.production ? [] : [],
      runtimeChecks: {
        strictActionImmutability: true,
        strictStateImmutability: true,
      },
    }),
    provideEffects([ProductsEffects]),
    providePersistStore<typeof appState>({
      states: [
        {
          key: productFeature.name,
          storage: localStorageStrategy,
          source: (source) => source.pipe(),
          migrations: [
            {
              version: 1,
              migrate: (state): ProductsState =>
                ({
                  ...state,
                  additionalProp: 'here',
                  version: 2,
                }) as ProductsState & {
                  additionalProp: string;
                },
            },
          ],
        } as const,
      ],
    }),
    provideSyncStore<typeof appState>({
      states: [{ key: productFeature.name }],
    }),
    !environment.production
      ? provideStoreDevtools({ connectInZone: true })
      : [],
    importProvidersFrom(BrowserModule, FormsModule),
  ],
}).catch((err: unknown) => {
  console.error(err);
});
