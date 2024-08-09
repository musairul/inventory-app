const pool = require("./pool");

async function getAll(tableName) {
  const query = `SELECT * FROM ${tableName}`;
  const { rows } = await pool.query(query);
  return rows;
}

// Generic Insert Function
async function insert(tableName, columnName, value) {
  const query = `INSERT INTO ${tableName} (${columnName}) VALUES ($1) ON CONFLICT (${columnName}) DO NOTHING`;
  await pool.query(query, [value]);
}

async function insertLinks(
  tableName,
  columnOne,
  columnTwo,
  valueOne,
  valueTwo
) {
  const query = `INSERT INTO ${tableName} (${columnOne}, ${columnTwo}) VALUES ($1, $2) ON CONFLICT (${columnOne}, ${columnTwo}) DO NOTHING`;
  await pool.query(query, [valueOne, valueTwo]);
}

// Get ID by Name Function
async function getIdByName(tableName, columnName, name) {
  const query = `SELECT id FROM ${tableName} WHERE ${columnName} = $1`;
  const { rows } = await pool.query(query, [name]);
  if (rows.length === 0) {
    throw new Error(`${tableName.slice(0, -1)} with name "${name}" not found`);
  }
  return rows[0].id;
}

async function getGameById(id) {
  const query = `SELECT id,title FROM games WHERE id = $1`;
  const { rows } = await pool.query(query, [id]);
  if (rows.length === 0) {
    throw new Error("not found");
  }

  console.log(rows);
  return rows[0];
}

async function deleteFromGenreId(tableName, id) {
  try {
    // Remove the genre from the `game_genre` table
    await pool.query(`DELETE FROM game_genre WHERE genre_id = $1`, [id]);

    // Delete the genre from the `genres` table
    await pool.query(`DELETE FROM genres WHERE id = $1`, [id]);
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function deleteFromDevId(tableName, id) {
  try {
    // Remove the genre from the `game_genre` table
    await pool.query(`DELETE FROM game_developer WHERE developer_id = $1`, [
      id,
    ]);

    // Delete the genre from the `genres` table
    await pool.query(`DELETE FROM developers WHERE id = $1`, [id]);
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// In your queries file
async function getDevelopersByGameId(gameId) {
  const query = `
    SELECT d.* 
    FROM developers d
    JOIN game_developer gd ON d.id = gd.developer_id
    WHERE gd.game_id = $1
  `;
  const { rows } = await pool.query(query, [gameId]);
  return rows;
}

async function getGenresByGameId(gameId) {
  const query = `
    SELECT g.* 
    FROM genres g
    JOIN game_genre gg ON g.id = gg.genre_id
    WHERE gg.game_id = $1
  `;
  const { rows } = await pool.query(query, [gameId]);
  return rows;
}

async function deleteGameAndLinks(gameId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN"); // Start transaction

    // Delete all related entries in game_developer
    await client.query("DELETE FROM game_developer WHERE game_id = $1", [
      gameId,
    ]);

    // Delete all related entries in game_genre
    await client.query("DELETE FROM game_genre WHERE game_id = $1", [gameId]);

    // Delete the game itself
    await client.query("DELETE FROM games WHERE id = $1", [gameId]);

    await client.query("COMMIT"); // Commit transaction
  } catch (err) {
    await client.query("ROLLBACK"); // Rollback transaction on error
    console.error("Error deleting game and related links:", err);
    throw err;
  } finally {
    client.release(); // Release the client back to the pool
  }
}

module.exports = {
  getAll,
  insert,
  getIdByName,
  deleteFromGenreId,
  deleteFromDevId,
  getDevelopersByGameId,
  getGenresByGameId,
  insertLinks,
  deleteGameAndLinks,
  getGameById,
};
