const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");

const USERS_TABLE = process.env.USERS_TABLE;
const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT || undefined;

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: DYNAMODB_ENDPOINT, 
});
const dynamoDb = DynamoDBDocumentClient.from(client);

const getUsers = async (event, context) => {
  try {
    if (!event.pathParameters || !event.pathParameters.id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "User ID is required" }),
      };
    }

    const userId = event.pathParameters.id;

    const params = {
      TableName: USERS_TABLE,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId },
    };

    const result = await dynamoDb.send(new QueryCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify({ user: result.Items || [] }),
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
  getUsers
}