const ModuleDependency = require('webpack/lib/dependencies/ModuleDependency');

class GoogLoaderSuffixDependency extends ModuleDependency {
  constructor(request, isModule, insertPosition) {
    super(request);
    this.insertPosition = insertPosition;
    this.isGoogModule = isModule;
  }

  get type() {
    return 'goog loader suffix';
  }

  updateHash(hash) {
    hash.update(this.insertPosition + '');
    hash.update(this.isGoogModule + '');
  }
}

class GoogLoaderSuffixDependencyTemplate {
  apply(dep, source) {
    if (dep.insertPosition === null) {
      return;
    }

    let content = '';
    if (dep.isGoogModule) {
      //
      // If the module was loaded with declareLegacyNamespace, ensure existing
      // globals on the module path aren't replaced by merging the exports into
      // the existing object.
      //
      // This merge order is intended to preserve the load order of the files.
      //
      content = `
if (goog.moduleLoaderState_.declareLegacyNamespace) {
  const existingExports = goog.module.get(goog.moduleLoaderState_.moduleName);
  if (existingExports) {
    exports = Object.assign(existingExports, exports);
  }
}
return exports; });`;
    }
    content += `
goog.moduleLoaderState_ = googPreviousLoaderState__;`;
    source.insert(dep.insertPosition, content);
  }
}

module.exports = GoogLoaderSuffixDependency;
module.exports.Template = GoogLoaderSuffixDependencyTemplate;
