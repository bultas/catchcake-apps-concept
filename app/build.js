const rollup = require("rollup");
const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
const replace = require("rollup-plugin-replace");

const inputOptions = {
  input: "./server.js",
  plugins: [
    commonjs(),
    resolve({
      customResolveOptions: {
        moduleDirectory: "node_modules"
      }
    })
  ]
};

const outputOptions = {
  file: "dist/app.js",
  format: "cjs",
  name: "app"
};

const browserInputOptions = {
  input: "./browser.js",
  plugins: [
    replace({
      "process.env.NODE_ENV": JSON.stringify("production")
    }),
    commonjs(),
    resolve({
      customResolveOptions: {
        moduleDirectory: "node_modules"
      }
    })
  ]
};

const browserOutputOptions = {
  file: "dist/app-browser.js",
  format: "iife"
};

async function build() {
  const serverBundle = await rollup.rollup(inputOptions);
  const browserBundle = await rollup.rollup(browserInputOptions);

  await serverBundle.write(outputOptions);
  await browserBundle.write(browserOutputOptions);
}

build();
