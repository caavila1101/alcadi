const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const PLAYERS_TABLE = process.env.PLAYERS_TABLE;
const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT || undefined;

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: DYNAMODB_ENDPOINT, 
});
const dynamoDb = DynamoDBDocumentClient.from(client);

const deletePlayer = async (event, context) => {
    try {
        const { id } = event.pathParameters || {}; 

        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Player ID" }),
            };
        }

        const params = {
            TableName: PLAYERS_TABLE,
            Key: { 
                playerId: id
            },
        };

        await dynamoDb.send(new DeleteCommand(params));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: `Player ${id} deleted successfully` }),
        };


    } catch (error) {
        console.error("Error deleting player:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
        };
    }
}

module.exports = {
    deletePlayer
}