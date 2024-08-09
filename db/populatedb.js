const { Client } = require("pg");
const { connectionString } = require("pg/lib/defaults");
require("dotenv").config();

const SQL = `
    CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
        title VARCHAR (255) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS genres (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
        genre VARCHAR (255) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS developers (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
        developer VARCHAR (255) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS game_genre (
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
        PRIMARY KEY (game_id, genre_id)
    );

    CREATE TABLE IF NOT EXISTS game_developer (
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE,
        PRIMARY KEY (game_id, developer_id)
    );

    INSERT INTO games (title) VALUES 
    ('The Legend of Zelda: Breath of the Wild'),
    ('Super Mario Odyssey'),
    ('Minecraft'),
    ('The Witcher 3: Wild Hunt')
    ON CONFLICT (title) DO NOTHING;

    INSERT INTO genres (genre) VALUES 
    ('Action-Adventure'),
    ('Platformer'),
    ('Sandbox'),
    ('RPG')
    ON CONFLICT (genre) DO NOTHING;

    INSERT INTO developers (developer) VALUES 
    ('Nintendo'),
    ('Mojang Studios'),
    ('CD Projekt Red')
    ON CONFLICT (developer) DO NOTHING;

    INSERT INTO game_genre (game_id, genre_id) 
    SELECT g.id, ge.id
    FROM games g
    JOIN genres ge ON ge.genre = 'Action-Adventure'
    WHERE g.title = 'The Legend of Zelda: Breath of the Wild'
    ON CONFLICT (game_id, genre_id) DO NOTHING;

    INSERT INTO game_genre (game_id, genre_id) 
    SELECT g.id, ge.id
    FROM games g
    JOIN genres ge ON ge.genre = 'Platformer'
    WHERE g.title = 'Super Mario Odyssey'
    ON CONFLICT (game_id, genre_id) DO NOTHING;

    INSERT INTO game_genre (game_id, genre_id) 
    SELECT g.id, ge.id
    FROM games g
    JOIN genres ge ON ge.genre = 'Sandbox'
    WHERE g.title = 'Minecraft'
    ON CONFLICT (game_id, genre_id) DO NOTHING;

    INSERT INTO game_genre (game_id, genre_id) 
    SELECT g.id, ge.id
    FROM games g
    JOIN genres ge ON ge.genre = 'RPG'
    WHERE g.title = 'The Witcher 3: Wild Hunt'
    ON CONFLICT (game_id, genre_id) DO NOTHING;

    INSERT INTO game_developer (game_id, developer_id) 
    SELECT g.id, d.id
    FROM games g
    JOIN developers d ON d.developer = 'Nintendo'
    WHERE g.title = 'The Legend of Zelda: Breath of the Wild'
    ON CONFLICT (game_id, developer_id) DO NOTHING;

    INSERT INTO game_developer (game_id, developer_id) 
    SELECT g.id, d.id
    FROM games g
    JOIN developers d ON d.developer = 'Nintendo'
    WHERE g.title = 'Super Mario Odyssey'
    ON CONFLICT (game_id, developer_id) DO NOTHING;

    INSERT INTO game_developer (game_id, developer_id) 
    SELECT g.id, d.id
    FROM games g
    JOIN developers d ON d.developer = 'Mojang Studios'
    WHERE g.title = 'Minecraft'
    ON CONFLICT (game_id, developer_id) DO NOTHING;

    INSERT INTO game_developer (game_id, developer_id) 
    SELECT g.id, d.id
    FROM games g
    JOIN developers d ON d.developer = 'CD Projekt Red'
    WHERE g.title = 'The Witcher 3: Wild Hunt'
    ON CONFLICT (game_id, developer_id) DO NOTHING;`;

async function main() {
  console.log("seeding");
  const client = new Client({
    connectionString: process.env.CONNECTION_STRING,
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done");
}

main();
