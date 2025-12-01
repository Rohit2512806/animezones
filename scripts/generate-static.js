const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// Load .env
require("dotenv").config();

const Anime = require("../models/anime"); // Correct model import

async function generateStaticPages() {
  console.log("📡 MongoDB Connecting...");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✔ Database Connected!");

  const animes = await Anime.find({}).lean();
  console.log(`📦 Total animes found: ${animes.length}`);

  const outputDir = path.join(__dirname, "..", "public", "animes");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (let anime of animes) {
    const html = `
      <html>
        <head>
          <title>${anime.title}</title>
        </head>
        <body>
          <h1>${anime.title}</h1>
          <img src="${anime.img}" width="250" />
          <p>${anime.description}</p>
          <p><b>Genre:</b> ${anime.genre?.join(", ")}</p>
          <p><b>Release:</b> ${anime.releaseDate}</p>
        </body>
      </html>
    `;

    fs.writeFileSync(
      path.join(outputDir, `${anime.id}.html`),
      html,
      "utf-8"
    );
  }

  console.log("🎉 Static HTML pages created successfully!");

  mongoose.connection.close();
}

generateStaticPages();
