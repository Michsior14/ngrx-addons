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
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    PersistStateModule.forRoot({
      states: [
        {
          key: productFeature.name,
          storage: localStorageStrategy,
        },
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
