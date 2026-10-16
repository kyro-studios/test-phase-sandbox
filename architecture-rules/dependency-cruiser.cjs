// docs/architecture.md の 4.1 (フロントエンドのモジュール間の依存の向き) のルール。
// リポジトリのルートで実行する前提で、パスはルートからの相対パスで書く。
const src = "^app/frontend/src";
const testFile = "\\.test\\.tsx?$";
// 内部のモジュールのうち、許可されたもの以外を禁止する対象にする (外部のパッケージは対象外)
const internal = `${src}/`;

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      comment: "循環する依存を禁止する",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "main-only-to-routes-and-shared",
      comment: "main.tsx は routes と shared に依存する (features への直接の依存を含め、それ以外は禁止)",
      severity: "error",
      from: { path: `${src}/main\\.tsx$` },
      to: { path: internal, pathNot: [`${src}/routes/`, `${src}/shared/`] },
    },
    {
      name: "routes-only-to-features-and-shared",
      comment: "routes は features/* と shared に依存する (main.tsx など、それ以外は禁止)",
      severity: "error",
      from: { path: `${src}/routes/`, pathNot: testFile },
      to: { path: internal, pathNot: [`${src}/routes/`, `${src}/features/`, `${src}/shared/`] },
    },
    {
      name: "features-only-to-same-feature-and-shared",
      comment: "features/<A> は同じ features/<A> の中と shared に依存する (routes と別の機能は禁止)",
      severity: "error",
      from: { path: `${src}/features/([^/]+)/`, pathNot: testFile },
      to: { path: internal, pathNot: [`${src}/features/$1/`, `${src}/shared/`] },
    },
    {
      name: "shared-only-to-shared",
      comment: "shared は shared の中だけに依存する",
      severity: "error",
      from: { path: `${src}/shared/`, pathNot: testFile },
      to: { path: internal, pathNot: `${src}/shared/` },
    },
    {
      name: "src-not-to-e2e-or-tests",
      comment: "src の本体のコードから、e2e とテストファイルへは依存しない",
      severity: "error",
      from: { path: `${src}/`, pathNot: testFile },
      to: { path: [`^app/frontend/e2e/`, testFile] },
    },
    {
      name: "no-undeclared-dependencies",
      comment: "package.json に宣言されていない外部のパッケージを使わない",
      severity: "error",
      from: {},
      to: { dependencyTypes: ["npm-no-pkg", "npm-unknown"] },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
    },
  },
};
