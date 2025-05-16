const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = "FiveAside";
const containerId = "Polls";

module.exports = async function (context, req) {
  context.log("submitPoll triggered");

  const { name, status, date } = req.body;
  context.log("Request body:", { name, status, date });

  if (!name || !status || !date) {
    context.res = { status: 400, body: "Missing fields" };
    return;
  }

  if (!endpoint || !key) {
    context.res = { status: 500, body: "Missing CosmosDB config" };
    return;
  }

  try {
    const client = new CosmosClient({ endpoint, key });
    const container = client.database(databaseId).container(containerId);

    await container.items.create({
      name,
      status,
      date,
      timestamp: new Date().toISOString(),
    });

    context.res = {
      status: 200,
      body: "Poll submitted",
    };
  } catch (err) {
    context.log.error("Cosmos error:", err.message);
    context.res = {
      status: 500,
      body: `Failed to save: ${err.message}`,
    };
  }
};
