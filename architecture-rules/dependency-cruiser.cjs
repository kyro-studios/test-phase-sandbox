// docs/architecture.md の 4.1 (フロントエンドのモジュール間の依存の向き) のルール。
// リポジトリのルートで実行する前提で、パスはルートからの相対パスで書く。
const src = "^app/frontend/src";
const testFile = "\\.test\\.tsx?$";

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
      name: "main-not-to-features",
      comment: "main.tsx は features に直接依存しない",
      severity: "error",
      from: { path: `${src}/main\\.tsx$` },
      to: { path: `${src}/features/` },
    },
    {
      name: "features-not-to-routes",
      comment: "features は routes に依存しない",
      severity: "error",
      from: { path: `${src}/features/`, pathNot: testFile },
      to: { path: `${src}/routes/` },
    },
    {
      name: "features-not-to-other-features",
      comment: "features/<A> は別の機能 features/<B> に依存しない",
      severity: "error",
      from: { path: `${src}/features/([^/]+)/`, pathNot: testFile },
      to: { path: `${src}/features/[^/]+/`, pathNot: `${src}/features/$1/` },
    },
    {
      name: "shared-not-to-routes-or-features",
      comment: "shared は shared の中だけに依存する",
      severity: "error",
      from: { path: `${src}/shared/`, pathNot: testFile },
      to: { path: `${src}/(routes|features)/` },
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
