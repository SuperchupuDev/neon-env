import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  declaration: true,
  rollup: {
    emitCJS: true
  },
  hooks: {
    'rollup:options': (_, options) => {
      if (!Array.isArray(options.output)) {
        return;
      }
      options.output[0].sourcemap = true;
      options.output[1].sourcemap = true;
    }
  }
});
