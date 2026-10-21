const j = (...a) => a.filter(Boolean).join('/').replace(/\/+/g, '/');
module.exports = { join: j, resolve: j, dirname: (p) => p.replace(/\/[^/]*$/, ''), basename: (p) => p.replace(/.*\//, ''), relative: (a, b) => b, sep: '/', normalize: (p) => p };
