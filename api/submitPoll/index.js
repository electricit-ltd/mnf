const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_ENDPOINT;
const key      = process.env.COSMOS_KEY;

const client    = new CosmosClient({ endpoint, key });
const database  = client.database("FiveAside");
const container = database.container("Polls");

module.exports = async function (context, req) {
  context.log("submitPoll triggered");

  const { name, status, date } = req.body;
  if (!name || !status || !date) {
    context.res = { status: 400, body: "Missing fields" };
    return;
  }

  // Use a deterministic id so upserting replaces duplicates
  const id = `${date}-${name}`;

  try {
    await container.items.upsert(
      {
        id,
        name,
        status,
        date,
        timestamp: new Date().toISOString(),
      },
      { partitionKey: date }
    );

    context.res = {
      status: 200,
      body: "Poll submitted",
    };
  } catch (err) {
    context.log.error("Error writing to Cosmos:", err);
    context.res = {
      status: 500,
      body: `Failed to save: ${err.message}`,
    };
  }
};
