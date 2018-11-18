const rollup = require("rollup");
const resolve = require("rollup-plugin-node-resolve");
// const commonjs = require("rollup-plugin-commonjs");
// const replace = require("rollup-plugin-replace");

const serverInputOptions = {
  input: "./index.js"
  // plugins: [commonjs()] // Because of React dependencies
};

const serverOutputOptions = {
  file: "dist/index.js",
  format: "cjs",
  name: "app"
};

const browserInputOptions = {
  input: ["./browser.js"],
  // input: "./browser.js",
  plugins: [
    // replace({
    //   "process.env.NODE_ENV": JSON.stringify("development")
    // }),
    // commonjs(),
    resolve({
      customResolveOptions: {
        moduleDirectory: "node_modules"
      }
    })
  ],
  experimentalCodeSplitting: true
};

const browserOutputOptions = {
  // file: "dist/browser.js",
  dir: "dist",
  format: "esm",
  sourcemap: true
};

async function build() {
  const serverBundle = await rollup.rollup(serverInputOptions);
  const browserBundle = await rollup.rollup(browserInputOptions);

  await serverBundle.write(serverOutputOptions);
  await browserBundle.write(browserOutputOptions);
}

build();
