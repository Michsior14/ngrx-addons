import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { featureA } from './feature-a/feature-a.module';
import { featureB } from './feature-b/feature-b.module';
import { globalAction } from './shared';
import { AsyncPipe, JsonPipe } from '@angular/common';

@Component({
  selector: 'example-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [AsyncPipe, JsonPipe],
})
export class AppComponent {
  private readonly store = inject(Store);

  public aState = this.store.select(featureA.selectAState);

  public bState = this.store.select(featureB.selectBState);

  public updateFeatures(): void {
    this.store.dispatch(globalAction());
  }
}
