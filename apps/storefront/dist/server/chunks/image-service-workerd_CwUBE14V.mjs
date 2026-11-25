globalThis.process ??= {};
globalThis.process.env ??= {};
import { b as baseService } from "./image-transform-endpoint_Dua78D1r.mjs";
const service = {
  ...baseService,
  async transform(inputBuffer, transform) {
    return { data: inputBuffer, format: transform.format };
  }
};
var image_service_workerd_default = service;
export {
  image_service_workerd_default as default
};
//# sourceMappingURL=image-service-workerd_CwUBE14V.mjs.map
