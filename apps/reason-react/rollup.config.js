import resolve from "rollup-plugin-node-resolve";
import replace from "rollup-plugin-replace";
import commonjs from "rollup-plugin-commonjs";
import gzip from "rollup-plugin-gzip";

const env = process.env.NODE_ENV;

export default {
  input: "./lib/js/src/App.bs.js",
  output: {
    file: "dist/bundle.js",
    format: "esm"
    // sourcemap: true
  },
  plugins: [
    resolve(),
    commonjs(),
    replace({
      "process.env.NODE_ENV": JSON.stringify(env)
    })
    // gzip()
  ]
};
