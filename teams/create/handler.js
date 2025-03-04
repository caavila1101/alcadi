const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");

const TEAM_TABLE = process.env.TEAMS_TABLE;
const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT || undefined;

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: DYNAMODB_ENDPOINT,
});

const dynamoDb = DynamoDBDocumentClient.from(client);

const createTeam = async (event, context) => {

    try {
        const body = JSON.parse(event.body);
        const { name, shortName, logoUrl, country, city, teamColor } = body;
    
        const teamId = uuidv4();

        const params = {
            TableName: TEAM_TABLE,
            Item: { teamId, name, shortName, logoUrl, country, city, teamColor }
        }

        if (!teamId ) {
            return {
              statusCode: 400,
              body: JSON.stringify({ error: "All fields are required" }),
            };
        }

        await dynamoDb.send(new PutCommand(params));
    
        return {
            statusCode: 201,
            body: JSON.stringify({ message: "Team created", team: { teamId, name, shortName, logoUrl, country, city, teamColor } }),
        };

    } catch (error) {
        console.error("Error creating team:", error);
        return {
        statusCode: 500,
        body: JSON.stringify({ error: "Could not create a team" }),
        };
    }

}

module.exports = {
    createTeam
}