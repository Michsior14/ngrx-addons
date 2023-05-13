import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const productsActions = createActionGroup({
  source: 'Products',
  events: {
    /* eslint-disable @typescript-eslint/naming-convention */
    'Add Product': props<{ name: string }>(),
    'Remove Product': props<{ id: string }>(),
    'Remove Products': emptyProps(),
    /* eslint-enable @typescript-eslint/naming-convention */
  },
});
