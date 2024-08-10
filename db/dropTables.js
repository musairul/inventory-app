const { Client } = require("pg");
const { connectionString } = require("pg/lib/defaults");
require("dotenv").config();

const SQL = `
    DROP TABLE games CASCADE;
    DROP TABLE developers CASCADE;
    DROP TABLE genres CASCADE;
    DROP TABLE game_genre CASCADE;
    DROP TABLE game_developer CASCADE;
    `;

async function main() {
  console.log("dropping...");
  const client = new Client({
    connectionString: process.env.CONNECTION_STRING,
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done");
}

main();
