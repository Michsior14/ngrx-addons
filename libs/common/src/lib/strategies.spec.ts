import {
  AfterAppInit,
  BeforeAppInit,
  afterAppInitProvider,
} from './strategies';

describe('strategies', () => {
  describe('AfterAppInit', () => {
    it('should resolve after initialization is signalized', (done) => {
      const afterAppInit = new AfterAppInit();
      afterAppInit.when().subscribe({
        next: () => {
          done();
        },
        error: () => {
          throw new Error('should not happen');
        },
      });
      afterAppInit.markAsInitialized();
    });

    it('should resolve only once', (done) => {
      const afterAppInit = new AfterAppInit();
      let counter = 0;
      afterAppInit.when().subscribe({
        next: () => {
          counter++;
        },
        error: () => {
          throw new Error('should not happen');
        },
        complete: () => {
          expect(counter).toBe(1);
          done();
        },
      });
      afterAppInit.markAsInitialized();
      afterAppInit.markAsInitialized();
    });

    it('should implement OnDestroy', () => {
      const afterAppInit = new AfterAppInit();
      expect(() => {
        afterAppInit.ngOnDestroy();
      }).not.toThrow();
    });

    it('should complete without an error if destroyed before initialization', (done) => {
      const afterAppInit = new AfterAppInit();
      const next = jest.fn();
      afterAppInit.when().subscribe({
        next,
        error: () => {
          throw new Error('should not happen');
        },
        complete: () => {
          expect(next).not.toHaveBeenCalled();
          done();
        },
      });
      afterAppInit.ngOnDestroy();
    });
  });

  describe('afterAppInitProvider', () => {
    it('should signal initialization in factory', () => {
      const afterAppInitMock = {
        markAsInitialized: jest.fn(),
        ngOnDestroy: jest.fn(),
        when: jest.fn(),
      } satisfies Record<keyof AfterAppInit, jest.Mock>;

      const factory = afterAppInitProvider.useFactory(
        afterAppInitMock as unknown as AfterAppInit,
      );
      factory();
      expect(afterAppInitMock.markAsInitialized).toHaveBeenCalled();
    });
  });

  describe('BeforeAppInit', () => {
    it('should resolve immediately', (done) => {
      const beforeAppInit = new BeforeAppInit();
      beforeAppInit.when().subscribe({
        next: () => {
          done();
        },
        error: () => {
          throw new Error('should not happen');
        },
      });
    });
  });
});
