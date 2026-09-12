import {deepSignalTests} from '../../stories-shared/tests/deep-signal.tests.ts';
import {fixtureBundle} from '../../stories-shared/tests/fixtureBundle.ts';

deepSignalTests(() =>
  fixtureBundle(new URL('./fixtures/deep-signal.ts', import.meta.url))
);
