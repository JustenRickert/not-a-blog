module.exports = {
  parser: "babel-eslint",
  plugins: ["react"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "react/jsx-uses-vars": "error"
  }
};
