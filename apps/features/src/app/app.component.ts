import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { featureA } from './feature-a/feature-a.module';
import { featureB } from './feature-b/feature-b.module';
import { globalAction } from './shared';

@Component({
  selector: 'example-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent {
  private readonly store = inject(Store);

  public aState = this.store.select(featureA.selectAState);

  public bState = this.store.select(featureB.selectBState);

  public updateFeatures(): void {
    this.store.dispatch(globalAction());
  }
}
