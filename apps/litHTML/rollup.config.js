import resolve from "rollup-plugin-node-resolve";

export default {
  input: "./modules/init.js",
  output: {
    file: "static/bundle.js",
    format: "esm",
    sourcemap: true
  },
  plugins: [resolve()]
};
