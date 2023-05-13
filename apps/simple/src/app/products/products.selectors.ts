import { createSelector } from '@ngrx/store';
import { productFeature } from './products.reducer';

export const { selectProducts, selectProductsState } = productFeature;

export const selectProductsEntries = createSelector(
  selectProducts,
  (products) => Object.entries(products)
);
