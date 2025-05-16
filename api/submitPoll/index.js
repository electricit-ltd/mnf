const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;

let container;

// Initialise Cosmos client only once, reused across requests
if (endpoint && key) {
  const client = new CosmosClient({ endpoint, key });
  const database = client.database("FiveAside");
  container = database.container("Polls");
}

module.exports = async function (context, req) {
  context.log("submitPoll triggered");

  const { name, status, date } = req.body;
  context.log("Request body:", { name, status, date });

  if (!name || !status || !date) {
    context.res = { status: 400, body: "Missing fields" };
    return;
  }

  if (!container) {
    context.res = { status: 500, body: "Missing Cosmos config or failed to initialise client" };
    return;
  }

  try {
    context.log("Connected to container");

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
    context.log.error("Error writing to Cosmos:", err.message, err.stack);
    context.res = {
      status: 500,
      body: `Failed to save: ${err.message}`,
    };
  }
};
