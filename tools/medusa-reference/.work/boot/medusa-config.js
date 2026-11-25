import base from "../../medusa-config.js";
const jwt = process.env.JWT_SECRET;
const patch = {
  user: { jwt_secret: jwt },
  auth: { providers: [{ resolve: "@medusajs/medusa/auth-emailpass", id: "emailpass", options: {} }] },
};
const modules = { ...base.modules, workflows: { resolve: "@medusajs/medusa/workflow-engine-inmemory" } };
for (const [k, o] of Object.entries(patch)) modules[k] = { ...modules[k], options: { ...(modules[k]?.options ?? {}), ...o } };
export default { ...base, projectConfig: { ...base.projectConfig, http: { ...base.projectConfig.http, jwtSecret: jwt } }, modules };
