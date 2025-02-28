const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");

const PLAYERS_TABLE = process.env.PLAYERS_TABLE;
const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT || undefined;

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: DYNAMODB_ENDPOINT, 
});
const dynamoDb = DynamoDBDocumentClient.from(client);

const getPlayers = async (event, context) => {
  try {
    if (!event.pathParameters || !event.pathParameters.id || !event.pathParameters.team) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Player ID is required" }),
      };
    }

    const playerId = event.pathParameters.id;
    const teamPlayer = event.pathParameters.team;

    const params = {
      TableName: PLAYERS_TABLE,
      KeyConditionExpression: "playerId = :playerId AND currentTeam = :teamPlayer",
      ExpressionAttributeValues: { 
        ":playerId": playerId,
        ":teamPlayer": teamPlayer
      },
    };

    const result = await dynamoDb.send(new QueryCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify({ player: result.Items || [] }),
    };
  } catch (error) {
    console.error("Error querying DynamoDB", event);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" , details: error.message }),
    };
  }
};

module.exports = {
  getPlayers
}