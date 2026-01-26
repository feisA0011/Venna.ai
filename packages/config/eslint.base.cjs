module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  env: {
    es2022: true,
    node: true
  },
  extends: ["eslint:recommended"],
  rules: {
    "no-console": "off"
  }
};
