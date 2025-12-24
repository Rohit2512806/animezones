import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Anime from "../models/anime.js";

dotenv.config();

const __dirname = new URL('.', import.meta.url).pathname;

async function generateStaticPages() {
  console.log("📡 MongoDB Connecting...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✔ Database Connected!");

  const animes = await Anime.find({}).lean();
  console.log(`📦 Total animes found: ${animes.length}`);

  const header = fs.readFileSync(
    path.join(__dirname, "../public/header.html"),
    "utf-8"
  );

  const footer = fs.readFileSync(
    path.join(__dirname, "../public/footer.html"),
    "utf-8"
  );

  const outputDir = path.join(__dirname, "../public/animes");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const anime of animes) {
    const episodeHTML = anime.episodes?.length
      ? anime.episodes.map(ep => `
          <li>
            <a href="/anime-detail.html?title=${encodeURIComponent(anime.title)}">
              ${anime.title} Episode ${ep.episodeNum}
            </a>
          </li>
        `).join("")
      : "<li>No episodes available</li>";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${anime.title} All Episodes Watch Online</title>

  <meta name="description"
    content="Watch ${anime.title} all episodes online in HD. Latest episode updates on AnimeZone.">

  <link rel="canonical"
    href="https://animezone.sbs/animes/${anime.slug}.html">

  <link rel="stylesheet" href="/components.css">
</head>

<body>

${header}

<main style="max-width:900px;margin:auto;padding:20px">
  <h1>${anime.title}</h1>

  <img src="${anime.img}" alt="${anime.title}" width="250">

  <p>${anime.description}</p>

  <p><b>Genre:</b> ${anime.genre?.join(", ")}</p>
  <p><b>Release:</b> ${anime.releaseDate}</p>

  <h2>All Episodes</h2>
  <ul>
    ${episodeHTML}
  </ul>

  <p>
    👉 <a href="/anime-detail.html?title=${encodeURIComponent(anime.title)}">
      Watch ${anime.title} Online
    </a>
  </p>
</main>

${footer}

</body>
</html>
`;

    fs.writeFileSync(
      path.join(outputDir, `${anime.slug}.html`),
      html,
      "utf-8"
    );
  }

  console.log("🎉 Static SEO pages generated!");
  mongoose.connection.close();
}

generateStaticPages();
