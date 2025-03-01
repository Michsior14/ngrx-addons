import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  localStorageStrategy,
  PersistStateModule,
} from '@ngrx-addons/persist-state';
import { SyncStateModule } from '@ngrx-addons/sync-state';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { ProductsEffects } from './products/products.effects';
import type { ProductsState } from './products/products.reducer';
import { productFeature } from './products/products.reducer';

const appState = {
  [productFeature.name]: productFeature.reducer,
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    StoreModule.forRoot(appState, {
      metaReducers: !environment.production ? [] : [],
      runtimeChecks: {
        strictActionImmutability: true,
        strictStateImmutability: true,
      },
    }),
    EffectsModule.forRoot([ProductsEffects]),
    !environment.production
      ? StoreDevtoolsModule.instrument({ connectInZone: true })
      : [],
    PersistStateModule.forRoot<typeof appState>({
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
                }) as ProductsState & { additionalProp: string },
            },
          ],
        } as const,
      ],
    }),
    SyncStateModule.forRoot({
      states: [{ key: productFeature.name }],
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
