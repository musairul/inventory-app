const express = require("express");
const router = express.Router();
const controller = require("../controllers/indexController");

router.get("/", controller.getIndex);
router.get("/games", controller.getGamesWithDetails);

router.get("/addGame", controller.getNewGame);
router.post("/addGame", controller.postAddGame);

router.get("/developers", controller.getDevelopers);
router.get("/genres", controller.getGenres);

router.post("/developers", controller.postDeveloper);
router.post("/genres", controller.postGenre);

router.post("/delete-genre/:id", controller.deleteGenreById);
router.post("/delete-developer/:id", controller.deleteDeveloperById);
router.post("/delete-card/:id", controller.deleteCard);

router.post("/update-game/:id", controller.updateGame);
router.get("/editGame/:id", controller.editCard);

module.exports = router;
