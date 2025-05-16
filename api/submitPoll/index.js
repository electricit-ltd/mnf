const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const client = new CosmosClient({ endpoint, key });
const databaseId = "FiveAside";
const containerId = "Polls";

module.exports = async function (context, req) {
  const { name, status, date } = req.body;

  if (!name || !status || !date) {
    context.res = { status: 400, body: "Missing fields" };
    return;
  }

  try {
    const container = client.database(databaseId).container(containerId);
    await container.items.create({ name, status, date, timestamp: new Date().toISOString() });

    context.res = {
      status: 200,
      body: "Poll submitted",
    };
  } catch (err) {
    context.res = {
      status: 500,
      body: "Failed to save",
    };
  }
};
