import { enableProdMode, importProvidersFrom } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { providePersistStore } from '@ngrx-addons/persist-state';
import { provideSyncStore } from '@ngrx-addons/sync-state';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { AppComponent } from './app/app.component';
import { FeatureAModule } from './app/feature-a/feature-a.module';
import { FeatureBModule } from './app/feature-b/feature-b.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideStore(
      {},
      {
        metaReducers: !environment.production ? [] : [],
        runtimeChecks: {
          strictActionImmutability: true,
          strictStateImmutability: true,
        },
      },
    ),
    providePersistStore(),
    provideSyncStore(),
    !environment.production
      ? provideStoreDevtools({ connectInZone: true })
      : [],
    importProvidersFrom(
      BrowserModule,
      FormsModule,
      FeatureAModule,
      FeatureBModule,
    ),
  ],
}).catch((err: unknown) => {
  console.error(err);
});
