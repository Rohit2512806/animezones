const express = require("express");
const cors = require("cors"); 
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000; // ✅ Also update for Render deployment


const DATA_PATH = path.join(__dirname, "data", "animeList.json");

app.use(cors());             
app.use(express.json());
app.use(express.static("public"));


// Ensure file exists
if (!fs.existsSync(DATA_PATH)) {
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.writeFileSync(DATA_PATH, "[]");
}

// Home
app.get("/", (req, res) => {
  res.send("Welcome to Anime Backend API");
});

// Get all anime
app.get("/anime", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_PATH));

  // ✅ Sort by latest episode updatedAt (descending)
  const sorted = data.sort((a, b) => {
    const aUpdated = a.episodes?.[a.episodes.length - 1]?.updatedAt || "1970-01-01T00:00:00Z";
    const bUpdated = b.episodes?.[b.episodes.length - 1]?.updatedAt || "1970-01-01T00:00:00Z";
    return new Date(bUpdated) - new Date(aUpdated);
  });

  res.json(sorted);
});


// Get anime by ID
app.get("/anime/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const data = JSON.parse(fs.readFileSync(DATA_PATH));
  const anime = data.find(anime => anime.id === id);
  if (anime) {
    res.json(anime);
  } else {
    res.status(404).json({ error: "Anime not found" });
  }
});

// ✅ POST: Add new anime
app.post("/anime", (req, res) => {
  const { title, genre, imageUrl, description, releaseDate, totalEpisodes, episodes } = req.body;

  if (!title || !genre || !imageUrl || !description || !releaseDate || !totalEpisodes) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const data = JSON.parse(fs.readFileSync(DATA_PATH));
  const newAnime = {
    id: data.length > 0 ? data[data.length - 1].id + 1 : 1,
    title,
    genre,
    img: imageUrl,
    description,
    releaseDate,
    totalEpisodes,
    episodes: episodes || []
  };

  data.push(newAnime);
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

  res.json({ message: "Anime added successfully", anime: newAnime });
});

// ✅ POST: Add episode to existing anime
app.post("/anime/:id/episodes", (req, res) => {
  const animeId = parseInt(req.params.id);
  const { episodeNum, title, videoUrl, imageUrl, updatedAt } = req.body;

  if (!episodeNum || !title || !videoUrl || !imageUrl || !updatedAt) {
    return res.status(400).json({ error: "Missing episode fields" });
  }

  const data = JSON.parse(fs.readFileSync(DATA_PATH));
  const anime = data.find(anime => anime.id === animeId);

  if (!anime) {
    return res.status(404).json({ error: "Anime not found" });
  }

  // Check for duplicate episode number
  const existingEp = anime.episodes.find(ep => ep.episodeNum === episodeNum);
  if (existingEp) {
    return res.status(400).json({ error: "Episode number already exists" });
  }

  anime.episodes.push({ episodeNum, title, videoUrl, imageUrl, updatedAt });
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

  res.json({ message: "Episode added successfully", episodes: anime.episodes });
});

app.put("/anime/:id", (req, res) => {
  const animeId = parseInt(req.params.id);
  const updatedData = req.body;

  // Basic field check
  if (!updatedData.title || !updatedData.img || !updatedData.description) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // ✅ Duplicate episode number check
  if (updatedData.episodes) {
    const nums = updatedData.episodes.map(ep => ep.episodeNum);
    const duplicates = nums.filter((num, i) => nums.indexOf(num) !== i);
    if (duplicates.length > 0) {
      return res.status(400).json({ error: "Duplicate episode numbers found: " + [...new Set(duplicates)].join(", ") });
    }
  }

  const data = JSON.parse(fs.readFileSync(DATA_PATH));
  const index = data.findIndex(anime => anime.id === animeId);

  if (index === -1) {
    return res.status(404).json({ error: "Anime not found" });
  }

  data[index] = { id: animeId, ...updatedData };
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

  res.json({ message: "Anime updated successfully", anime: data[index] });
});

// ✅ DELETE anime by ID
app.delete("/anime/:id", (req, res) => {
  const animeId = parseInt(req.params.id);
  const data = JSON.parse(fs.readFileSync(DATA_PATH));

  const index = data.findIndex(anime => anime.id === animeId);
  if (index === -1) {
    return res.status(404).json({ error: "Anime not found" });
  }

  data.splice(index, 1); // remove the anime
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

  res.json({ message: `Anime with ID ${animeId} deleted successfully.` });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});