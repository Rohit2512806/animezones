import fs from "fs";
import path from "path";
import "dotenv/config.js";

const SITE = process.env.SITE_URL;
const animeFolder = path.join("public", "animes");

let urls = "";

if (fs.existsSync(animeFolder)) {
  const files = fs.readdirSync(animeFolder);

  files.forEach((file) => {
    const name = file.replace(".html", "");
    urls += `
      <url>
        <loc>${SITE}/animes/${name}</loc>
        <changefreq>weekly</changefreq>
      </url>
    `;
  });
}

const xml = `
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>
`;

fs.writeFileSync(path.join("public", "sitemap.xml"), xml);

console.log("✔ sitemap.xml generated!");
