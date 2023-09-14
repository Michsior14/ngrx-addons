import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { PersistStateModule } from '@ngrx-addons/persist-state';
import { SyncStateModule } from '@ngrx-addons/sync-state';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { FeatureAModule } from './feature-a/feature-a.module';
import { FeatureBModule } from './feature-b/feature-b.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    StoreModule.forRoot(
      {},
      {
        metaReducers: !environment.production ? [] : [],
        runtimeChecks: {
          strictActionImmutability: true,
          strictStateImmutability: true,
        },
      },
    ),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    PersistStateModule.forRoot(),
    SyncStateModule.forRoot(),
    FeatureAModule,
    FeatureBModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
