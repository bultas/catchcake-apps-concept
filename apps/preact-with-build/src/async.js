export const getAsyncNeco = () => {
  return new Promise(resolve => {
    setTimeout(async () => {
      const { getResult } = await import("./result.js");
      resolve(getResult());
    }, 1000);
  });
};
