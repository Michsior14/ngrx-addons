# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.0.0](https://github.com/Michsior14/ngrx-addons/compare/v4.0.1...v5.0.0) (2023-11-21)

### ⚠ BREAKING CHANGES

- update to angular 17 and ngrx 17 (#355)

### Features

- update to angular 17 and ngrx 17 ([#355](https://github.com/Michsior14/ngrx-addons/issues/355)) ([9e0e1bf](https://github.com/Michsior14/ngrx-addons/commit/9e0e1bfefb13cd9673e513f5140788b6d8548141))

## [4.0.1](https://github.com/Michsior14/ngrx-addons/compare/v4.0.0...v4.0.1) (2023-10-31)

### Bug Fixes

- make sure streams are always completed ([180a99b](https://github.com/Michsior14/ngrx-addons/commit/180a99bc9418c0d1d7994ad31028e2ebfd637f4f))

## 4.0.0 (2023-08-10)

### ⚠ BREAKING CHANGES

- update to angular 16
- upgrade to angular 15 and ngrx 15

### Features

- add initialization strategies ([#183](https://github.com/Michsior14/ngrx-addons/issues/183)) ([3585f44](https://github.com/Michsior14/ngrx-addons/commit/3585f44add4a5c95ae0c737bd8cb90728dbece79)), closes [#182](https://github.com/Michsior14/ngrx-addons/issues/182)
- add persist-state package ([c0ed7dc](https://github.com/Michsior14/ngrx-addons/commit/c0ed7dccb4f1a548e17724bc8afb7214227507d6))
- add sync state lib ([#9](https://github.com/Michsior14/ngrx-addons/issues/9)) ([9e27911](https://github.com/Michsior14/ngrx-addons/commit/9e279110f4c54c1464da5ad0883912803692044b))
- allow skipping configs in `forRoot` calls ([#185](https://github.com/Michsior14/ngrx-addons/issues/185)) ([dbc606c](https://github.com/Michsior14/ngrx-addons/commit/dbc606c34df1dbb28ac0bd126a8ad6c1e85bc02c))
- **persist-state:** add possibility to adjust number of state skip ([f4aea6e](https://github.com/Michsior14/ngrx-addons/commit/f4aea6ed65cc20355a0cb2adcf4601f41600977a))
- **persist-state:** support migrations ([34731d9](https://github.com/Michsior14/ngrx-addons/commit/34731d9620564aabfa22ac58a32522d4b9b8aa4f))
- update to angular 16 ([dd051b1](https://github.com/Michsior14/ngrx-addons/commit/dd051b108f79ea3cbf1c15ee241cc9992effb5b3))
- upgrade to angular 15 and ngrx 15 ([1227351](https://github.com/Michsior14/ngrx-addons/commit/1227351f3e71b0ae712e379f5544b604a4ec5a31))

### Bug Fixes

- forFeatures registered only once ([#192](https://github.com/Michsior14/ngrx-addons/issues/192)) ([21bcd0c](https://github.com/Michsior14/ngrx-addons/commit/21bcd0c630de2f2087eadf3f2877ce3be153273d)), closes [#191](https://github.com/Michsior14/ngrx-addons/issues/191)
- forRoot source typings ([#189](https://github.com/Michsior14/ngrx-addons/issues/189)) ([46fc84b](https://github.com/Michsior14/ngrx-addons/commit/46fc84b6a984724795382d9bbd57a5eccde9fef8))
- lock common lib to specific version ([95d8c61](https://github.com/Michsior14/ngrx-addons/commit/95d8c612c8eb6eb1ea830c13b84f214069e40338))
- **persist-state:** add missing rxjs peer dependency ([3318475](https://github.com/Michsior14/ngrx-addons/commit/3318475f72bcaa1a6c715cad3f4f20047fdcf887))
- **persist-state:** expose createStore ([6160f81](https://github.com/Michsior14/ngrx-addons/commit/6160f8133a3531ed6113ad554b08cd6a3bfbe49f))
- provide default type in feature modules ([#179](https://github.com/Michsior14/ngrx-addons/issues/179)) ([3c35ff7](https://github.com/Michsior14/ngrx-addons/commit/3c35ff7f25fe2ee4b3a94b48482b31c66895b954)), closes [#178](https://github.com/Michsior14/ngrx-addons/issues/178)
- remove migrations file ([26fda30](https://github.com/Michsior14/ngrx-addons/commit/26fda30fcfd6b0724606a15cc57995a1f87710f3))
- wait to access storage until ready for strategies ([#184](https://github.com/Michsior14/ngrx-addons/issues/184)) ([cdbee08](https://github.com/Michsior14/ngrx-addons/commit/cdbee08b615848b96f3c6effd848608282074d67))
