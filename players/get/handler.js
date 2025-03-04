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
    const queryParams = event.queryStringParameters || {};

    if (!queryParams.name && !queryParams.lastName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Provide at least 'name' or 'lastName' as query parameters" }),
      };
    }

    let params;

    if (queryParams.name && queryParams.lastName) {
      params = {
        TableName: PLAYERS_TABLE,
        IndexName: "NameIndex",
        KeyConditionExpression: "#name = :nameValue AND #lastName = :lastNameValue",
        ExpressionAttributeNames: { "#name": "name", "#lastName": "lastName" },
        ExpressionAttributeValues: { 
          ":nameValue": queryParams.name, 
          ":lastNameValue": queryParams.lastName 
        }
      };
    } else if (queryParams.name) {
      params = {
        TableName: PLAYERS_TABLE,
        IndexName: "NameIndex",
        KeyConditionExpression: "#name = :nameValue",
        ExpressionAttributeNames: { "#name": "name" },
        ExpressionAttributeValues: { ":nameValue": queryParams.name }
      };
    } else if (queryParams.lastName) {
      params = {
        TableName: PLAYERS_TABLE,
        IndexName: "LastNameIndex",
        KeyConditionExpression: "#lastName = :lastNameValue",
        ExpressionAttributeNames: { "#lastName": "lastName" },
        ExpressionAttributeValues: { ":lastNameValue": queryParams.lastName }
      };
    }

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