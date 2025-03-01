import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const productsActions = createActionGroup({
  source: 'Products',
  events: {
    'Add Product': props<{ name: string }>(),
    'Remove Product': props<{ id: string }>(),
    'Remove Products': emptyProps(),
  },
});
