import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { productsActions } from './products/products.actions';
import { selectProductsEntries } from './products/products.selectors';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'example-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [FormsModule, AsyncPipe],
})
export class AppComponent {
  public product = '';

  public products = this.store.select(selectProductsEntries);

  constructor(private readonly store: Store) {}

  public addProduct() {
    if (!this.product.length) {
      return;
    }

    this.store.dispatch(productsActions.addProduct({ name: this.product }));
    this.product = '';
  }

  public removeProduct(id: string) {
    this.store.dispatch(productsActions.removeProduct({ id }));
  }

  public removeAll(): void {
    this.store.dispatch(productsActions.removeProducts());
  }
}
