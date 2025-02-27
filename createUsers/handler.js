const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const USERS_TABLE = process.env.USERS_TABLE;
const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT || undefined;

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: DYNAMODB_ENDPOINT,
});
const dynamoDb = DynamoDBDocumentClient.from(client);

const createUser = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const { userId, name } = body;

    if (typeof userId !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '"userId" must be a string' }),
      };
    } else if (typeof name !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '"name" must be a string' }),
      };
    }

    const params = {
      TableName: USERS_TABLE,
      Item: { userId, name },
    };

    await dynamoDb.send(new PutCommand(params));

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "User created", user: { userId, name } }),
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not create user" }),
    };
  }
};

module.exports = {
  createUser
}