const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");

const PLAYERS_TABLE = process.env.PLAYERS_TABLE;
const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT || undefined;

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: DYNAMODB_ENDPOINT, 
});
const dynamoDb = DynamoDBDocumentClient.from(client);

const updatePlayer = async (event, context) => {
    try {
        const { id } = event.pathParameters || {};
        const { name, lastName, dateBirth, position, preferredFoot, height, weight } = JSON.parse(event.body);
        
        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Player ID" }),
            };
        }

        if(!name && !lastName && !dateBirth && !position && !preferredFoot && !height && !weight){
            return {
                statusCode: 400,
                body: JSON.stringify(
                    {
                        error: "Provide at least one field to update"
                    }
                )
            };
        }

        const params = {
            TableName: PLAYERS_TABLE,
            Key: { playerId: id },
            UpdateExpression: "SET #name = :name, #lastName = :lastName, #dateBirth = :dateBirth, #position = :position, #preferredFoot = :preferredFoot, #height = :height, #weight = :weight",
            ExpressionAttributeNames: { 
                '#name': 'name', 
                '#lastName': 'lastName', 
                '#dateBirth': 'dateBirth', 
                '#position': 'position', 
                '#preferredFoot': 'preferredFoot', 
                '#height': 'height', 
                '#weight': 'weight' }, 
            ExpressionAttributeValues: {
                ":name": name,
                ":lastName": lastName,
                ":dateBirth": dateBirth,
                ":position": position,
                ":preferredFoot": preferredFoot,
                ":height": height,
                ":weight": weight,
              },
            ReturnValues: 'ALL_NEW',
        };

        const result = await dynamoDb.send(new UpdateCommand(params));

        return {
            statusCode: 200,
            body: JSON.stringify(result.Attributes),
        };

    } catch (error) {
        console.error("Error updating DynamoDB", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
        };
    }
};

module.exports = { updatePlayer };
