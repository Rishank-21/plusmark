import { createApiKeysWorkflow, linkSalesChannelsToApiKeyWorkflow } from "@medusajs/core-flows";
export default async function ({ container }) {
  const { result } = await createApiKeysWorkflow(container).run({ input: { api_keys: [{ title: "rehearsal", type: "publishable", created_by: "" }] } });
  const query = container.resolve("query");
  const { data: channels } = await query.graph({ entity: "sales_channel", fields: ["id"] });
  await linkSalesChannelsToApiKeyWorkflow(container).run({ input: { id: result[0].id, add: channels.map((c) => c.id) } });
  console.log("PUBKEY:" + result[0].token);
}
