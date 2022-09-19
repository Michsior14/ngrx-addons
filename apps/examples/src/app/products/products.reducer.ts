import { createFeature, createReducer, on } from '@ngrx/store';
import { v4 as uuid } from 'uuid';
import { productsActions } from './products.actions';

export interface Product {
  name: string;
}

export interface ProductsState {
  products: Record<string, Product>;
}

const initialState = Object.freeze<ProductsState>({
  products: {},
});

export const productFeature = createFeature({
  name: 'products',
  reducer: createReducer(
    initialState,
    on(
      productsActions.addProduct,
      (state, { name }): ProductsState => ({
        ...state,
        products: { ...state.products, [uuid()]: { name } },
      })
    ),
    on(
      productsActions.removeProduct,
      (state, { id }): ProductsState => ({
        ...state,
        products: Object.fromEntries(
          Object.entries(state.products).filter(([key]) => key !== id)
        ),
      })
    ),
    on(
      productsActions.removeProducts,
      (state): ProductsState => ({ ...state, products: {} })
    )
  ),
});
