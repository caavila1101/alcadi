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
        const { name, lastName, dateBirth, nationality, position, currentTeam } = JSON.parse(event.body);
        
        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Player ID" }),
            };
        }

        const paramsSortedKey = {
            TableName: PLAYERS_TABLE,
            KeyConditionExpression: "playerId = :playerId",
            ExpressionAttributeValues: { 
              ":playerId": id,
            },
        };

        const getSortedKey = await dynamoDb.send(new QueryCommand(paramsSortedKey));
        let getTeamHistory = (getSortedKey.Items[0]?.teamHistory ?? []);

        if (!getTeamHistory.includes(currentTeam)) {
            getTeamHistory.push(currentTeam); 
        }

        const params = {
            TableName: PLAYERS_TABLE,  
            Key: { playerId: id },
            UpdateExpression: 'SET #name = :name , #lastName = :lastName, #dateBirth = :dateBirth, #nationality = :nationality, #position = :position, #currentTeam = :currentTeam, teamHistory = :teamHistory',  
            ExpressionAttributeNames: { '#name': 'name', '#lastName': 'lastName', '#dateBirth': 'dateBirth', '#nationality': 'nationality', '#position': 'position', '#currentTeam': 'currentTeam' }, 
            ExpressionAttributeValues: { ':name': name, ':lastName': lastName, ':dateBirth': dateBirth, ':nationality': nationality, ':position': position, ':currentTeam': currentTeam, ':teamHistory': getTeamHistory},
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
