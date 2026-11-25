globalThis.process ??= {};
globalThis.process.env ??= {};
const onRequest = (_, next) => next();
export {
  onRequest
};
//# sourceMappingURL=virtual_astro_middleware.mjs.map
