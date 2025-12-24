const mongoose = require("mongoose");

const AnimeSchema = new mongoose.Schema({
  id: Number,
  title: String,
  img: String,
  description: String,
  releaseDate: String,
  genre: [String],
  episodes: Array
});

module.exports = mongoose.model("Anime", AnimeSchema, "animes");
