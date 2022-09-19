/**
 * @deprecated Please import it from `@ngrx/common` instead. Will be removed in v2.
 */
export { excludeKeys } from '@ngrx-addons/common';
export {
  REHYDRATE,
  rehydrate,
  storeRehydrateAction,
} from './lib/persist-state.actions';
export {
  PersistStateConfig,
  PersistStateFeatureConfig,
  PersistStateRoot,
  PersistStateRootConfig,
} from './lib/persist-state.config';
export { PersistStateFeatureModule } from './lib/persist-state.feature.module';
export { PersistStateModule } from './lib/persist-state.module';
export { PersistStateRootModule } from './lib/persist-state.root.module';
export {
  Async,
  createStorage,
  localStorageStrategy,
  sessionStorageStrategy,
  StateStorage,
} from './lib/storage';
