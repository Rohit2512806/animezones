require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;
const client = new MongoClient(process.env.MONGO_URI);

let animeCollection;

app.use(cors({
  origin: [
    "http://localhost:3000", 
    "https://animezone.sbs",         // Frontend
    "https://api.animezone.sbs"      // Backend custom domain (Render)
  ]
}));

app.use(express.json());
app.use(express.static("public"));

 /* Root route to confirm API is working*/
app.get("/", (req, res) => {
  res.send("Welcome to Anime Backend API (MongoDB Version)");
});

 /* Get all anime - sorted by latest updated episode*/
app.get("/anime", async (req, res) => {
  try {
    const allAnime = await animeCollection
      .find({}, { projection: { _id: 0 } }) 
      .toArray();

    const sorted = allAnime.sort((a, b) => {
      const aUpdated = a.episodes?.[a.episodes.length - 1]?.updatedAt || "1970-01-01T00:00:00Z";
      const bUpdated = b.episodes?.[b.episodes.length - 1]?.updatedAt || "1970-01-01T00:00:00Z";
      return new Date(bUpdated) - new Date(aUpdated);
    });

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch anime." });
  }
});

/**
 * Get one anime by ID - removes _id
 */
app.get("/anime/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const anime = await animeCollection.findOne({ id }, { projection: { _id: 0 } }); // ⛔ Remove _id
  if (anime) {
    res.json(anime);
  } else {
    res.status(404).json({ error: "Anime not found" });
  }
});

/**
 * Add a new anime
 */
app.post("/anime", async (req, res) => {
  const { title, genre, imageUrl, description, releaseDate, totalEpisodes, episodes } = req.body;

  if (!title || !genre || !imageUrl || !description || !releaseDate || !totalEpisodes) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const lastAnime = await animeCollection.find().sort({ id: -1 }).limit(1).toArray();
  const newId = lastAnime.length > 0 ? lastAnime[0].id + 1 : 1;

  const newAnime = {
    id: newId,
    title,
    genre,
    img: imageUrl,
    description,
    releaseDate,
    totalEpisodes,
    episodes: episodes || []
  };

  await animeCollection.insertOne(newAnime);
  res.json({ message: "Anime added successfully", anime: newAnime });
});

/**
 * Add a new episode to a specific anime
 */
app.post("/anime/:id/episodes", async (req, res) => {
  const animeId = parseInt(req.params.id);
  const { episodeNum, title, videoUrl, imageUrl, updatedAt } = req.body;

  if (!episodeNum || !title || !videoUrl || !imageUrl || !updatedAt) {
    return res.status(400).json({ error: "Missing episode fields" });
  }

  const anime = await animeCollection.findOne({ id: animeId });
  if (!anime) return res.status(404).json({ error: "Anime not found" });

  if (anime.episodes.find(ep => ep.episodeNum === episodeNum)) {
    return res.status(400).json({ error: "Episode number already exists" });
  }

  await animeCollection.updateOne(
    { id: animeId },
    { $push: { episodes: { episodeNum, title, videoUrl, imageUrl, updatedAt } } }
  );

  res.json({ message: "Episode added successfully" });
});

/**
 * Update an existing anime by ID
 */
app.put("/anime/:id", async (req, res) => {
  const animeId = parseInt(req.params.id);
  const updatedData = req.body;

  if (!updatedData.title || !updatedData.img || !updatedData.description) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const existingAnime = await animeCollection.findOne({ id: animeId });
  if (!existingAnime) {
    return res.status(404).json({ error: "Anime not found" });
  }

  let newEpisodes = updatedData.episodes || existingAnime.episodes || [];

  // Smart merge of episodes: preserve old updatedAt where not modified
  const mergedEpisodes = newEpisodes.map(newEp => {
    const oldEp = existingAnime.episodes?.find(e => e.episodeNum === newEp.episodeNum);
    const isModified = !oldEp || oldEp.videoUrl !== newEp.videoUrl || oldEp.title !== newEp.title || oldEp.imageUrl !== newEp.imageUrl;
    return {
      ...newEp,
      updatedAt: isModified ? newEp.updatedAt || new Date().toISOString() : oldEp.updatedAt
    };
  });

  await animeCollection.updateOne(
    { id: animeId },
    {
      $set: {
        title: updatedData.title,
        genre: updatedData.genre,
        img: updatedData.img,
        description: updatedData.description,
        releaseDate: updatedData.releaseDate,
        totalEpisodes: updatedData.totalEpisodes,
        episodes: mergedEpisodes
      }
    }
  );

  res.json({ message: "Anime updated successfully" });
});


/**
 * Delete an anime by ID
 */
app.delete("/anime/:id", async (req, res) => {
  const animeId = parseInt(req.params.id);
  const result = await animeCollection.deleteOne({ id: animeId });

  if (result.deletedCount === 0) {
    return res.status(404).json({ error: "Anime not found" });
  }

  res.json({ message: `Anime with ID ${animeId} deleted successfully.` });
});

/**
 * Connect to MongoDB and start the server
 */
async function startServer() {
  try {
    await client.connect();
    const db = client.db("animeDB");
    animeCollection = db.collection("animes");

    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed", err);
  }
}

startServer();
