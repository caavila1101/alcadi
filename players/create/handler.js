const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");

const PLAYERS_TABLE = process.env.PLAYERS_TABLE;
const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT || undefined;

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: DYNAMODB_ENDPOINT,
});
const dynamoDb = DynamoDBDocumentClient.from(client);

const createPlayer = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const { name, lastName, dateBirth, nacionality, position, currentTeam, teamHistory } = body;
    console.log("Received body:", body); // ⬅️ Agregar esta línea

    const playerId = uuidv4();

    const params = {
      TableName: PLAYERS_TABLE,
      Item: { playerId, name, lastName, dateBirth, nacionality, position, currentTeam, teamHistory },
    };

    if (!playerId || !name || !lastName || !dateBirth || !nacionality || !position || !currentTeam || !teamHistory) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "All fields are required" }),
      };
    }
    console.log("Received body:", params); // ⬅️ Agregar esta línea

    await dynamoDb.send(new PutCommand(params));

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Player created", user: { playerId, name, lastName, dateBirth, nacionality, position, currentTeam, teamHistory } }),
    };
  } catch (error) {
    console.error("Error creating player:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not create player" }),
    };
  }
};

module.exports = {
  createPlayer
}