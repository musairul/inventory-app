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

async function updateLinks(gameId, tableName, columnName, newLinks) {
  const deleteQuery = `DELETE FROM ${tableName} WHERE game_id = $1`;
  const insertQuery = `INSERT INTO ${tableName} (game_id, ${columnName}) VALUES ($1, $2) ON CONFLICT DO NOTHING`;

  const client = await pool.connect();

  try {
    // Start a transaction
    await client.query("BEGIN");

    // Delete existing links
    await client.query(deleteQuery, [gameId]);

    // Insert new links
    for (const linkId of newLinks) {
      await client.query(insertQuery, [gameId, linkId]);
    }

    // Commit transaction
    await client.query("COMMIT");
    console.log(`Links updated for game ID ${gameId} in table ${tableName}`);
  } catch (err) {
    // Rollback transaction in case of error
    await client.query("ROLLBACK");
    console.error("Error updating links:", err);
    throw err;
  } finally {
    client.release();
  }
}

async function updateGame(gameId, gameName) {
  const query = `UPDATE games SET title = $1 WHERE id = $2`;
  try {
    await pool.query(query, [gameName, gameId]);
    console.log(`Game with ID ${gameId} updated to "${gameName}"`);
  } catch (err) {
    console.error("Error updating game:", err);
    throw err;
  }
}

async function getGamesByDevId(devId) {
  const query = `SELECT g.title FROM games g JOIN game_developer gd ON g.id = gd.game_id WHERE gd.developer_id = $1;`;
  try {
    const { rows } = await pool.query(query, [devId]);
    return rows;
  } catch (err) {
    console.error("Error :", err);
    throw err;
  }
}

async function getGamesByGenreId(genreId) {
  const query = `SELECT g.title FROM games g JOIN game_genre gg ON g.id = gg.game_id WHERE gg.genre_id = $1;`;
  try {
    const { rows } = await pool.query(query, [genreId]);
    return rows;
  } catch (err) {
    console.error("Error :", err);
    throw err;
  }
}

async function getDevById(id) {
  const query = `SELECT developer FROM developers WHERE id = $1;`;
  try {
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  } catch (err) {
    console.err("Error:", err);
    throw err;
  }
}

async function getGenreById(id) {
  const query = `SELECT genre FROM genres WHERE id = $1;`;
  try {
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  } catch (err) {
    console.err("Error:", err);
    throw err;
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
  updateGame,
  updateLinks,
  getGamesByDevId,
  getGamesByGenreId,
  getDevById,
  getGenreById,
};
