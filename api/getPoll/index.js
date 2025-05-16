const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_ENDPOINT;
const key      = process.env.COSMOS_KEY;
const client   = new CosmosClient({ endpoint, key });
const container= client.database("FiveAside").container("Polls");

module.exports = async function (context, req) {
  const date = req.query.date;
  if (!date) {
    context.res = { status: 400, body: "Missing date query parameter" };
    return;
  }

  try {
    const querySpec = {
      query: "SELECT c.name, c.status FROM c WHERE c.date = @date",
      parameters: [{ name: "@date", value: date }]
    };
    const { resources: items } = await container.items.query(querySpec).fetchAll();
    
    // Group by status
    const groups = { in: [], maybe: [], out: [] };
    items.forEach(item => {
      const s = item.status.toLowerCase();
      if (s === "yes" || s === "in") groups.in.push(item.name);
      else if (s === "maybe")        groups.maybe.push(item.name);
      else                             groups.out.push(item.name);
    });

    context.res = { status: 200, body: groups };
  } catch (err) {
    context.log.error("getPoll error:", err.message);
    context.res = { status: 500, body: err.message };
  }
};
