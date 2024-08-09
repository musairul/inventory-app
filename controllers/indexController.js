const queries = require("../db/queries");

async function getDevelopers(req, res) {
  const developers = await queries.getAll("developers");
  // console.log(developers);
  res.render("developers", {
    developers: developers,
  });
}

async function getGenres(req, res) {
  const genres = await queries.getAll("genres");
  // console.log(genres);
  res.render("genres", {
    genres: genres,
  });
}

function getIndex(req, res) {
  res.render("index");
}

async function getNewGame(req, res) {
  const genres = await queries.getAll("genres");
  const developers = await queries.getAll("developers");
  // console.log(developers);
  res.render("addGame", { developers: developers, genres: genres });
}

async function postDeveloper(req, res) {
  const { newDev } = req.body;
  // console.log(newDev);
  queries.insert("developers", "developer", newDev);
  res.redirect("/developers");
}

async function postGenre(req, res) {
  const { newGenre } = req.body;
  // console.log(newGenre);
  queries.insert("genres", "genre", newGenre);
  res.redirect("/genres");
}

async function postAddGame(req, res) {
  console.log(req.body);
  const { gameName, developers, genres } = req.body;
  console.log("attributes");
  console.log(gameName);
  console.log(developers);
  console.log(genres);
  await queries.insert("games", "title", gameName);
  const gameId = await queries.getIdByName("games", "title", gameName);
  console.log(gameId);

  for (const developer_id of developers) {
    await queries.insertLinks(
      "game_developer",
      "game_id",
      "developer_id",
      gameId,
      developer_id
    );
  }

  for (const genre_id of genres) {
    await queries.insertLinks(
      "game_genre",
      "game_id",
      "genre_id",
      gameId,
      genre_id
    );
  }

  res.redirect("/games");
}

async function deleteCard(req, res) {
  const gameId = req.params.id;
  await queries.deleteGameAndLinks(gameId);
  res.redirect("/games");
}

async function deleteGenreById(req, res) {
  const genreId = req.params.id;
  queries.deleteFromGenreId("genres", genreId);
  res.redirect("/genres");
}

async function deleteDeveloperById(req, res) {
  const developerId = req.params.id;
  queries.deleteFromDevId("developers", developerId);
  res.redirect("/developers");
}

async function getGamesWithDetails(req, res) {
  try {
    // Fetch all games
    const games = await queries.getAll("games");

    // Fetch developers and genres for each game
    for (let game of games) {
      // Fetch linked developers
      const developers = await queries.getDevelopersByGameId(game.id);

      // Fetch linked genres
      const genres = await queries.getGenresByGameId(game.id);

      // Add developers and genres to the game object
      game.developers = developers;
      game.genres = genres;
    }

    // Render the page with all games, developers, and genres
    // console.log(games);
    // console.log(games[0].developers);
    res.render("games", { games });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
}

async function updateGame(req, res) {
  const gameId = req.params.id;
  const { gameName, developers, genres } = req.body;

  try {
    await queries.updateGame(gameId, gameName);
    await queries.updateLinks(
      gameId,
      "game_developer",
      "developer_id",
      developers
    );
    await queries.updateLinks(gameId, "game_genre", "genre_id", genres);
    res.redirect("/games");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating the game");
  }
}

async function editCard(req, res) {
  console.log(req.params);
  const gameId = req.params.id;

  try {
    // Fetch the game details
    const game = await queries.getGameById(gameId);
    const developers = await queries.getAll("developers");
    const genres = await queries.getAll("genres");

    // // Fetch linked developers and genres for the game
    const linkedDevelopers = await queries.getDevelopersByGameId(gameId);
    const linkedGenres = await queries.getGenresByGameId(gameId);

    res.render("editGame", {
      game,
      developers,
      genres,
      linkedDevelopers,
      linkedGenres,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading the edit form");
  }
}

module.exports = {
  postDeveloper,
  getGenres,
  getIndex,
  postGenre,
  getDevelopers,
  deleteGenreById,
  deleteDeveloperById,
  getGamesWithDetails,
  getNewGame,
  postAddGame,
  deleteCard,
  updateGame,
  editCard,
};
