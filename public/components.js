// components.js

// Global Variable for Anime Data
window.allAnimeList = [];

// --- Helper Functions ---

// Function to create an anime card
function createAnimeCard(anime, isRecommendation, episode = null) {
    const wrapper = document.createElement('div');
    wrapper.className = 'anime-item';

    const link = document.createElement('a');
    let targetUrl;

    const epNum = episode ? episode.episodeNum : (anime.episodes?.at(-1)?.episodeNum || 1);

    if (episode) {
        targetUrl = `video-player.html?title=${encodeURIComponent(anime.title)}&ep=${epNum}`;
    } else if (isRecommendation) {
        if (anime.episodes && anime.episodes.length > 0) {
            targetUrl = `anime-detail.html?title=${encodeURIComponent(anime.title)}`;
        }
    } else {
         targetUrl = `video-player.html?title=${encodeURIComponent(anime.title)}&ep=${epNum}`;
    }

    link.href = targetUrl;
    link.style.textDecoration = 'none';
    link.style.color = 'inherit';

    const card = document.createElement('div');
    card.className = 'anime-card';

    const img = document.createElement('img');
    img.src = anime.img;
    img.alt = anime.title;
    card.appendChild(img);

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const episodeBtn = document.createElement('button');
    episodeBtn.className = 'episode-btn';
    episodeBtn.textContent = `Ep ${epNum}`;
    actions.appendChild(episodeBtn);

    const subBtn = document.createElement('button');
    subBtn.className = 'sub-btn';
    subBtn.textContent = 'Sub';

     const DonghuaBtn = document.createElement('button');
    DonghuaBtn.className = 'donghua-btn';
    DonghuaBtn.textContent = 'Donghua';
    actions.appendChild(DonghuaBtn);  // ⬅️ Ye line zaroori hai
    
    const fireIcon = document.createElement('i');
fireIcon.className = 'fas fa-fire fire-icon'; // Font Awesome fire icon
card.appendChild(fireIcon);


    if (isRecommendation) {
        const statusText = getAnimeStatus(anime.title);
        const statusSpan = document.createElement('span');
        statusSpan.className = 'recommendation-status';
        statusSpan.textContent = statusText;
        actions.appendChild(statusSpan);
        actions.appendChild(subBtn);
        episodeBtn.style.display = 'none';
    } else {
        actions.appendChild(subBtn);
    }

    card.appendChild(actions);

    const titleDiv = document.createElement('div');
    titleDiv.className = 'anime-title';
    titleDiv.textContent = anime.title;

    link.appendChild(card);
    link.appendChild(titleDiv);
    wrapper.appendChild(link);

    return wrapper;
}

// Function to get anime status
function getAnimeStatus(animeTitle) {
    if (typeof window.allAnimeList === 'undefined' || !window.allAnimeList) {
        return "Unknown";
    }

    const anime = window.allAnimeList.find(a => a.title === animeTitle);

    if (!anime) return "Unknown";

    const total = anime.totalEpisodes || 0;
    const episodes = anime.episodes || [];

    if (total === 0 && episodes.length > 0) {
        return "Ongoing";  // Unknown total, but episodes exist
    }

    if (episodes.length === 0) {
        return total === 0 ? "Unknown" : "Ongoing"; // No episodes yet
    }

    const lastEpisodeNumber = episodes.reduce((max, ep) => Math.max(max, ep.episodeNum), 0);

    if (lastEpisodeNumber === total) {
        return "Complete";
    }

    // Even if last episode is greater than total, still treat as Ongoing
    return "Ongoing";
}
// Global function to get anime by title
// This should only be used after allAnimeList has been loaded
window.getAnimeByTitle = function(title) {
    if (typeof window.allAnimeList !== 'undefined' && window.allAnimeList) {
        return window.allAnimeList.find(anime => anime.title === title);
    }
    return null;
};

// --- Page-Specific Rendering Functions ---

// renderLatestAnime section
function renderLatestAnime(animeList) {
    const latestAnimeGrid = document.getElementById('latestAnimeGrid');
    if (!latestAnimeGrid) return;

    latestAnimeGrid.innerHTML = '';

    const episodeCards = [];

    animeList.forEach(anime => {
        if (anime.episodes && anime.episodes.length > 0) {
            anime.episodes.forEach(ep => {
                episodeCards.push({
                    animeTitle: anime.title,
                    animeImg: anime.img,
                    episodeNum: ep.episodeNum,
                    updatedAt: ep.updatedAt,
                    anime,
                    episode: ep
                });
            });
        }
    });

    const sortedEpisodes = episodeCards.sort((a, b) => {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    const latestToShow = sortedEpisodes.slice(0, 20);

    latestToShow.forEach(ep => {
        const placeholderCard = createSkeletonCard(); // 🔹 Step 1: create skeleton
        latestAnimeGrid.appendChild(placeholderCard);

        const delay = Math.random() * 1000 + 200; // 1 to 4 sec

        setTimeout(() => {
            const realCard = createAnimeCard(ep.anime, false, ep.episode); // 🔹 Step 2: real content
            latestAnimeGrid.replaceChild(realCard, placeholderCard);
        }, delay);
    });
}

//renderAllAnime section
function renderAllAnime(animeList) {
    const allAnimeGrid = document.getElementById('allAnimeGrid');
    if (!allAnimeGrid) return;

    allAnimeGrid.innerHTML = '';

    animeList.forEach(anime => {
        let latestEpisode = null;

        if (anime.episodes && anime.episodes.length > 0) {
            latestEpisode = anime.episodes.reduce(
                (latest, ep) => ep.episodeNum > latest.episodeNum ? ep : latest,
                anime.episodes[0]
            );
        }

        const placeholder = createSkeletonCard();
        allAnimeGrid.appendChild(placeholder);

        const delay = Math.random() * 1000 + 200;

        setTimeout(() => {
            const realCard = createAnimeCard(anime, false, latestEpisode);
            allAnimeGrid.replaceChild(realCard, placeholder);
        }, delay);
    });
}
function createSkeletonCard() {
    const card = document.createElement('div');
    card.className = 'anime-card loading';

    card.innerHTML = `
        <div class="skeleton-img skeleton-box"></div>
        <div class="skeleton-text skeleton-line"></div>
        <div class="skeleton-text skeleton-line short"></div>
    `;

    return card;
}



// Home page: Set up recommendation buttons
function setupRecommendationButtons() {
    const btnDrama = document.getElementById('btnDrama');
    const btnHistorical = document.getElementById('btnHistorical');
    const btnAdventure = document.getElementById('btnAdventure');
    const btnReincarnation = document.getElementById('btnReincarnation');

    const filterRecommendationsByGenre = (genre) => {
        return window.allAnimeList.filter(anime => anime.genre && (Array.isArray(anime.genre) ? anime.genre.includes(genre) : anime.genre === genre));
    };
    if (btnDrama) {
         btnDrama.addEventListener('click', () => {
              const dramaAnime = filterRecommendationsByGenre("Drama");
              displayRecommendations(dramaAnime);
          });
    }
    
    if (btnHistorical) {
        btnHistorical.addEventListener('click', () => {
            const HistoricalAnime = filterRecommendationsByGenre("Historical");
            displayRecommendations(HistoricalAnime);
        });
    }

    if (btnAdventure) {
        btnAdventure.addEventListener('click', () => {
            const AdventureAnime = filterRecommendationsByGenre("Adventure");
            displayRecommendations(AdventureAnime);
        });
    }

    if (btnReincarnation) {
        btnReincarnation.addEventListener('click', () => {
            const ReincarnationAnime = filterRecommendationsByGenre("Reincarnation");
            displayRecommendations(ReincarnationAnime);
        });
    }
}

// Home page: Display recommendations
function displayRecommendations(animeList) {
    const recommendationGrid = document.getElementById('recommendationGrid');
    if (recommendationGrid) {
        recommendationGrid.innerHTML = '';
        if (animeList) {
            const numberOfRecommendationsToShow = 5;
            const limitedAnimeList = animeList.slice(0, numberOfRecommendationsToShow);
            limitedAnimeList.forEach(anime => {
                const animeElement = createAnimeCard(anime, true); // true for recommendation styling
                recommendationGrid.appendChild(animeElement);
            });
        }
    }
}

// Home page: Load new series section
async function loadNewSeriesSection() {
    try {
        const response = await fetch('new-series-section.html');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        const newSeriesPlaceholder = document.getElementById('newSeriesPlaceholder');
        if (newSeriesPlaceholder) {
            newSeriesPlaceholder.innerHTML = html;
            populateNewSeriesSection(); // Populate using already fetched data
        }
    } catch (error) {
    }
}

// Home page: Populate new series section
function populateNewSeriesSection() {
    const newAnimeSeriesGrid = document.getElementById('newAnimeSeriesGrid');
    if (newAnimeSeriesGrid && typeof window.allAnimeList !== 'undefined') {
        const sortedAnimeList = [...window.allAnimeList].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

        const numberOfAnimeToShow = 10;
        const limitedAnimeList = sortedAnimeList.slice(0, numberOfAnimeToShow);
        if (limitedAnimeList.length > 0) {
            newAnimeSeriesGrid.innerHTML = '';
            limitedAnimeList.forEach(anime => {
                const link = document.createElement('a');
                link.href = `anime-detail.html?title=${encodeURIComponent(anime.title)}`;
                link.style.textDecoration = 'none';
                link.style.color = 'inherit';

                const statusText = getAnimeStatus(anime.title);
                const statusClass = statusText === "Complete" ? "complete" : "ongoing";

                const card = document.createElement('div');
                card.className = 'anime-card';
                card.innerHTML = `
                    <img src="${anime.img}" alt="${anime.title}">
                    <div class="anime-info">
                        <div class="anime-title">${anime.title}</div>
                        <div class="status-episode ${statusClass}">${statusText} | ${anime.totalEpisodes || 'N/A'} Eps</div>
                        <div class="genre">${Array.isArray(anime.genre) ? anime.genre.join(', ') : (anime.genre || 'N/A')}</div>
                    </div>
                    `;
                link.appendChild(card);
                newAnimeSeriesGrid.appendChild(link);
            });
        } else {
            newAnimeSeriesGrid.innerHTML = '<p style="color: var(--muted-text);">No anime available.</p>';
        }
    }
}

// Home page: Load genre section
async function loadGenreSection() {
    try {
        const response = await fetch('genre-section-template.html');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        const genreListPlaceholder = document.getElementById('genreListPlaceholder');
        if (genreListPlaceholder) {
            genreListPlaceholder.innerHTML = html;
            populateGenreSection(); // Populate using already fetched data
        }
    } catch (error) {
    }
}

// Home page: Populate genre section
function populateGenreSection() {
    const genreListContainer = document.getElementById('genreListContainer');
    if (genreListContainer && typeof window.allAnimeList !== 'undefined') {
        const allGenres = new Set();
        window.allAnimeList.forEach(anime => {
            if (Array.isArray(anime.genre)) {
                anime.genre.forEach(g => allGenres.add(g));
            } else if (typeof anime.genre === 'string') {
                allGenres.add(anime.genre);
            }
        });

        genreListContainer.innerHTML = '';

        allGenres.forEach(genre => {
            const genreItem = document.createElement('div');
            genreItem.className = 'genre-item';
            genreItem.textContent = genre;
            genreItem.onclick = () => window.filterAnimeByGenre(genre); // Global filter function
            genreListContainer.appendChild(genreItem);
        });
    }
}

// All Anime page: Global variables for pagination
let itemsPerPage = 16;
let currentPage = 1;
let filteredAnimeList = []; // This will hold the list for pagination

// All Anime page: Display current page
function displayCurrentPage(animeListToDisplay) {
    const gridContainer = document.getElementById('allAnimeGrid');
    if (!gridContainer || typeof window.allAnimeList === 'undefined') return;

    // Show skeleton loader cards
    gridContainer.innerHTML = '';
    for (let i = 0; i < itemsPerPage; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-card';
        skeleton.innerHTML = `
            <div class="skeleton-thumbnail"></div>
            <div class="skeleton-title"></div>
            <div class="skeleton-subtitle"></div>
        `;
        gridContainer.appendChild(skeleton);
    }

    // Simulate data delay (800ms)
    setTimeout(() => {
        gridContainer.innerHTML = ''; // Clear skeletons

        if (animeListToDisplay.length === 0) {
            gridContainer.innerHTML = '<p style="color: var(--muted-text); text-align: center; padding: 20px;">No anime data available.</p>';
            updatePaginationControls(0);
            return;
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentItems = animeListToDisplay.slice(startIndex, endIndex);

        if (currentItems.length === 0 && currentPage > 1) {
            currentPage--;
            displayCurrentPage(animeListToDisplay);
            return;
        } else if (currentItems.length === 0) {
            gridContainer.innerHTML = '<p style="color: var(--muted-text); text-align: center; padding: 20px;">No anime found matching criteria.</p>';
            updatePaginationControls(0);
            return;
        }

        currentItems.forEach(anime => {
            const animeCardElement = createAnimeCard(anime, false);
            gridContainer.appendChild(animeCardElement);
        });

        updatePaginationControls(animeListToDisplay.length);
    }, ); // 800ms delay to simulate loading
}


// All Anime page: Update pagination controls
function updatePaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pageInfoSpan = document.getElementById('pageInfo');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');

    if (pageInfoSpan) pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
    if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// All Anime page: Go to next page
function nextPage() {
    const totalPages = Math.ceil(filteredAnimeList.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayCurrentPage(filteredAnimeList);
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// All Anime page: Go to previous page
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayCurrentPage(filteredAnimeList);
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}
//Add helper function:with anime date
function getTimeAgo(dateString) {
    const now = new Date();
    const updated = new Date(dateString);
    const seconds = Math.floor((now - updated) / 1000);

    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
        }
    }
    return 'Just now';
}

// Anime Detail page: Display anime details
function displayAnimeDetails(anime) {
    const container = document.getElementById('animeDetailContainer');
    if (!container) return;

    // Inject HTML including anime-info-card block
    container.innerHTML = `
        <div class="anime-detail-header">
            <h1>${anime.title}</h1>
            <p>${anime.description || 'No description available.'}</p>
        </div>

        <div class="anime-detail-info">
            <h2>Details</h2>
            <ul>
                <li><span>Status:</span> ${getAnimeStatus(anime.title)}</li>
                <li><span>Type:</span> ${anime.type || 'N/A'}</li>
                <li><span>Episodes:</span> ${anime.totalEpisodes || 'N/A'}</li>
                <li><span>Genre:</span> ${Array.isArray(anime.genre) ? anime.genre.join(', ') : (anime.genre || 'N/A')}</li>
                <li><span>Release Date:</span> ${anime.releaseDate || 'N/A'}</li>
            </ul>
        </div>

        <div class="anime-detail-actions">
            <a href="video-player.html?title=${encodeURIComponent(anime.title)}&ep=${anime.episodes && anime.episodes.length > 0 ? anime.episodes[0].episodeNum : 1}" class="watch-now-btn">
                Watch Now (First Episode)
            </a>
        </div>

        <section class="watch-anime-section">
            <h2 class="section-title">All Episodes ${anime.title}</h2>
            <div class="episode-nav">
                <a href="#" id="firstEpisodeLink">First Episode</a>
                <a href="#" id="lastEpisodeLink">Last Episode</a>
            </div>
        </section>
                 <div class="anime-info-card">
            <img id="animeInfoImage" class="anime-info-image" src="" alt="Anime Image" />
            <div class="anime-info-details">
                <h4 id="animeInfoTitle">Anime Title</h4>
                <span id="animeInfoStatus" class="anime-status">Status: Ongoing</span>
                <p id="animeInfoEpisodes">Total Episodes: ...</p>
            </div>
        </div>
        <section class="episode-list-section">
            <div class="episode-list-cards" id="episodeListCards"></div>
        </section>
        
    `;

    // 🟢 Update Anime Info Box
    document.getElementById('animeInfoImage').src = anime.img || 'default.jpg';
    document.getElementById('animeInfoTitle').textContent = anime.title || 'Untitled';
    document.getElementById('animeInfoEpisodes').textContent = `Total Episodes: ${anime.episodes?.length || 0}`;

   const statusElem = document.getElementById('animeInfoStatus');

// Episode numbers
const episodeNums = anime.episodes?.map(ep => ep.episodeNum || 0) || [];
const lastEpNum = Math.max(...episodeNums, 0);

// totalEpisodes parse karo
let totalCount = parseInt(anime.totalEpisodes);
if (isNaN(totalCount) || totalCount === 0) {
    totalCount = 0; // agar unknown ya invalid ho to treat as unknown
}

// Status logic
let status = 'Ongoing';
if (totalCount > 0 && lastEpNum === totalCount) {
    status = 'Completed';
}

statusElem.textContent = `Status: ${status}`;
statusElem.classList.remove('status-ongoing', 'status-completed');
statusElem.classList.add(status === 'Completed' ? 'status-completed' : 'status-ongoing');


    // Prepend cover image
    const animeCoverImg = document.createElement('img');
    animeCoverImg.src = anime.img;
    animeCoverImg.alt = `${anime.title} Cover`;
    animeCoverImg.className = 'anime-detail-cover';
    animeCoverImg.id = 'animeCoverImg';
    container.prepend(animeCoverImg);

    // Load Episodes
    const episodeListCards = document.getElementById('episodeListCards');
    const firstEpisodeLink = document.getElementById('firstEpisodeLink');
    const lastEpisodeLink = document.getElementById('lastEpisodeLink');

    if (episodeListCards && anime.episodes && anime.episodes.length > 0) {
        episodeListCards.innerHTML = '';
        anime.episodes.forEach(episode => {
            const episodeCard = document.createElement('div');
            episodeCard.classList.add('episode-list-item-card');
            episodeCard.dataset.episodeNumber = episode.episodeNum;

            if (episode.imageUrl) {
                const image = document.createElement('img');
                image.src = episode.imageUrl;
                image.alt = `Episode ${episode.episodeNum} Thumbnail`;
                image.classList.add('episode-item-image');
                episodeCard.appendChild(image);
            }

            const details = document.createElement('div');
            details.classList.add('episode-item-details');

            const title = document.createElement('h3');
            title.classList.add('episode-item-title');
            title.textContent = episode.title || `Episode ${episode.episodeNum}`;
            details.appendChild(title);

            const number = document.createElement('span');
            number.classList.add('episode-item-number');
            const updatedText = episode.updatedAt ? getTimeAgo(episode.updatedAt) : `Ep ${episode.episodeNum}`;
            number.textContent = updatedText;

            details.appendChild(number);

            episodeCard.appendChild(details);
            episodeListCards.appendChild(episodeCard);

            episodeCard.addEventListener('click', () => {
                window.location.href = `video-player.html?title=${encodeURIComponent(anime.title)}&ep=${episode.episodeNum}`;
            });
        });

        if (firstEpisodeLink) {
            firstEpisodeLink.href = `video-player.html?title=${encodeURIComponent(anime.title)}&ep=${anime.episodes[0].episodeNum}`;
            firstEpisodeLink.textContent = `First Episode ${anime.episodes[0].episodeNum}`;
        }

        if (lastEpisodeLink) {
            const lastEp = anime.episodes[anime.episodes.length - 1];
            lastEpisodeLink.href = `video-player.html?title=${encodeURIComponent(anime.title)}&ep=${lastEp.episodeNum}`;
            lastEpisodeLink.textContent = `Last Episode ${lastEp.episodeNum}`;
        }
    } else if (episodeListCards) {
        episodeListCards.innerHTML = '<p style="color: var(--muted-text); text-align: center;">No episodes available for this anime.</p>';
    }
}

// Video Player page: Display video player and episode list
function findMatchingEpisode(episodes, targetEpNum) {
    const target = parseInt(targetEpNum);

    for (const ep of episodes) {
        const raw = ep.episodeNum?.toString().trim();
        if (!raw) continue;

        if (raw.includes('-')) {
            const [start, end] = raw.split('-').map(n => parseInt(n.trim()));
            if (target >= start && target <= end) return ep;
        } else if (parseInt(raw) === target) {
            return ep;
        }
    }
    return null;
}

function displayVideoPlayerDetails(anime, episodeNum) {
    const videoPlayerSection = document.getElementById('videoPlayerSection');
    const currentAnimeTitleElem = document.getElementById('currentAnimeTitle');
    const videoWrapper = document.querySelector('.video-wrapper');
    const episodeListGrid = document.getElementById('episodeListGrid');

    if (!videoPlayerSection || !currentAnimeTitleElem || !videoWrapper || !episodeListGrid) {
        if (videoPlayerSection) videoPlayerSection.innerHTML = '<p style="text-align: center; color: var(--muted-text);">Error: Required player elements missing.</p>';
        return;
    }

    if (!anime || !anime.episodes || anime.episodes.length === 0) {
        currentAnimeTitleElem.textContent = 'No Episodes Found';
        videoWrapper.innerHTML = '<p style="text-align: center; color: var(--muted-text);">No video or episode information available for this anime.</p>';
        episodeListGrid.innerHTML = '<p style="text-align: center; color: var(--muted-text);">No episodes to list.</p>';
        return;
    }

    const currentEpisode = findMatchingEpisode(anime.episodes, episodeNum);

    if (!currentEpisode || !currentEpisode.videoUrl) {
        currentAnimeTitleElem.textContent = `${anime.title} - Episode ${episodeNum} Not Available`;
        videoWrapper.innerHTML = '<p style="text-align: center; color: var(--muted-text);">Episode not found or video URL is missing.</p>';
        episodeListGrid.innerHTML = '<p style="text-align: center; color: var(--muted-text);">Could not load this episode.</p>';
        return;
    }

    currentAnimeTitleElem.textContent = currentEpisode.title || `${anime.title} - Episode ${episodeNum}`;

    const url = currentEpisode.videoUrl;
    let embedCode = '';

    if (url.includes("youtube.com") || url.includes("youtu.be") || /^[a-zA-Z0-9_-]{11}$/.test(url)) {
        let videoId = '';
        if (url.includes("youtube.com/watch?v=")) {
            const urlParams = new URL(url);
            videoId = urlParams.searchParams.get("v");
        } else if (url.includes("youtu.be/")) {
            videoId = url.split("youtu.be/")[1];
        } else {
            videoId = url;
        }
        embedCode = `<iframe width="100%" height="100%" style="position:absolute; left:0; top:0; border:none;" 
                        src="https://www.youtube.com/embed/${videoId}" 
                        title="YouTube video player" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowfullscreen></iframe>`;
    }
    else if (url.includes("dailymotion.com/video/") || url.includes("dai.ly/") || /^[a-zA-Z0-9]+$/.test(url)) {
        let videoId = '';
        if (url.includes("dailymotion.com/video/")) {
            videoId = url.split("dailymotion.com/video/")[1].split("_")[0];
        } else if (url.includes("dai.ly/")) {
            videoId = url.split("dai.ly/")[1];
        } else {
            videoId = url;
        }
        embedCode = `<iframe width="100%" height="100%" style="position:absolute; left:0; top:0; border:none;" 
                        src="https://geo.dailymotion.com/player.html?video=${videoId}" 
                        allowfullscreen 
                        title="Dailymotion Video Player" 
                        allow="web-share"></iframe>`;
    }
    else if (url.endsWith(".mp4")) {
        embedCode = `<video width="100%" height="100%" style="position:absolute; left:0; top:0;" controls autoplay>
                       <source src="${url}" type="video/mp4">
                       Your browser does not support the video tag.
                     </video>`;
    }
    else {
        embedCode = `<p style="text-align: center; color: var(--muted-text);">Unsupported video platform or invalid video URL.</p>`;
    }

    videoWrapper.innerHTML = embedCode;

    // Anime Info Box Update
    document.getElementById('animeInfoImage').src = anime.img || 'default.jpg';
    document.getElementById('animeInfoTitle').textContent = anime.title || 'Untitled';
    document.getElementById('animeInfoEpisodes').textContent = `Total Episodes: ${anime.episodes.length || 0}`;

    const statusElem = document.getElementById('animeInfoStatus');
    const episodeNums = anime.episodes.map(ep => parseInt(ep.episodeNum?.toString().split('-')[0]) || 0);
    const lastEpNum = Math.max(...episodeNums);
    const totalCount = anime.totalEpisodes || lastEpNum;
    let status = 'Ongoing';
    if (lastEpNum === totalCount) status = 'Completed';

    statusElem.textContent = `Status: ${status}`;
    statusElem.classList.remove('status-ongoing', 'status-completed');
    statusElem.classList.add(status === 'Completed' ? 'status-completed' : 'status-ongoing');

    // Episode Navigation Setup
    function setupEpisodeNavigation(anime, currentEpNum) {
        const episodes = [...anime.episodes].sort((a, b) => {
            const aStart = parseInt(a.episodeNum?.toString().split('-')[0]);
            const bStart = parseInt(b.episodeNum?.toString().split('-')[0]);
            return aStart - bStart;
        });

        const currentIndex = episodes.findIndex(ep => findMatchingEpisode([ep], currentEpNum));

        const prevBtn = document.getElementById('prevEpisodeBtn');
        const nextBtn = document.getElementById('nextEpisodeBtn');

        if (!prevBtn || !nextBtn) return;

        if (currentIndex > 0) {
            const prevEpNum = parseInt(episodes[currentIndex - 1].episodeNum?.toString().split('-')[0]);
            prevBtn.disabled = false;
            prevBtn.onclick = () => {
                window.location.href = `video-player.html?title=${encodeURIComponent(anime.title)}&ep=${prevEpNum}`;
            };
        } else {
            prevBtn.disabled = true;
        }

        if (currentIndex < episodes.length - 1) {
            const nextEpNum = parseInt(episodes[currentIndex + 1].episodeNum?.toString().split('-')[0]);
            nextBtn.disabled = false;
            nextBtn.onclick = () => {
                window.location.href = `video-player.html?title=${encodeURIComponent(anime.title)}&ep=${nextEpNum}`;
            };
        } else {
            nextBtn.disabled = true;
        }
    }

    // Episode List Rendering
    episodeListGrid.innerHTML = '';
    episodeListGrid.classList.add('episode-list-cards');

    const sortedEpisodes = [...anime.episodes].sort((a, b) => {
        const aStart = parseInt(a.episodeNum?.toString().split('-')[0]);
        const bStart = parseInt(b.episodeNum?.toString().split('-')[0]);
        return aStart - bStart;
    });

    sortedEpisodes.forEach(episode => {
        const episodeCard = document.createElement('div');
        episodeCard.className = 'episode-list-item-card';
        episodeCard.dataset.episodeNumber = episode.episodeNum;

        if (episode.imageUrl) {
            const image = document.createElement('img');
            image.src = episode.imageUrl;
            image.alt = `Episode ${episode.episodeNum} Thumbnail`;
            image.classList.add('episode-item-image');
            episodeCard.appendChild(image);
        }

        const details = document.createElement('div');
        details.classList.add('episode-item-details');

        const title = document.createElement('h3');
        title.classList.add('episode-item-title');
        title.textContent = episode.title || `Episode ${episode.episodeNum}`;
        details.appendChild(title);

        const number = document.createElement('span');
        number.classList.add('episode-item-number');
        const updatedText = episode.updatedAt ? getTimeAgo(episode.updatedAt) : `Ep ${episode.episodeNum}`;
        number.textContent = updatedText;
        details.appendChild(number);

        episodeCard.appendChild(details);
        episodeListGrid.appendChild(episodeCard);

        episodeCard.addEventListener('click', () => {
            const firstEp = parseInt(episode.episodeNum?.toString().split('-')[0]);
            window.location.href = `video-player.html?title=${encodeURIComponent(anime.title)}&ep=${firstEp}`;
        });

        if (findMatchingEpisode([episode], episodeNum)) {
            episodeCard.classList.add('active-episode');
            const allElements = episodeCard.querySelectorAll('*');
            allElements.forEach(element => {
                element.style.color = '#111';
            });
        }
    });

    setupEpisodeNavigation(anime, parseInt(episodeNum));
}

// --- Main Data Fetch and Page-Specific Logic ---
fetch('https://animezones-64tp.onrender.com/anime')

    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        window.allAnimeList = data; // Store in global variable
        
        const currentPagePath = window.location.pathname;

        // --- Logic for index.html ---
        if (currentPagePath === '/' || currentPagePath.includes('index.html')) {
            renderLatestAnime(data);
            setupRecommendationButtons();
            const defaultDramaAnime = window.allAnimeList.filter(anime => anime.genre && (Array.isArray(anime.genre) ? anime.genre.includes("Drama") : anime.genre === "Drama"));
            displayRecommendations(defaultDramaAnime);
            loadNewSeriesSection();
            loadGenreSection();
        }
        // --- Logic for all-anime.html ---
        else if (currentPagePath.includes('all-anime.html')) {
            filteredAnimeList = [...data];
            displayCurrentPage(filteredAnimeList);
            setupAllAnimePageListeners();
            loadNewSeriesSection();
            loadGenreSection();
        }
        // --- Logic for anime-detail.html ---
        else if (currentPagePath.includes('anime-detail.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            const animeTitle = urlParams.get('title');
            if (animeTitle) {
                const anime = window.getAnimeByTitle(decodeURIComponent(animeTitle));
                if (anime) {
                    displayAnimeDetails(anime);
                } else {
                    const detailContainer = document.getElementById('animeDetailContainer');
                    if(detailContainer) {
                        detailContainer.innerHTML = '<p style="text-align: center; color: var(--muted-text);">Sorry, anime details not found.</p>';
                    }
                }
            } else {
                 const detailContainer = document.getElementById('animeDetailContainer');
                    if(detailContainer) {
                        detailContainer.innerHTML = '<p style="text-align: center; color: var(--muted-text);">Sorry, no anime selected to display details.</p>';
                    }
            }
            loadNewSeriesSection();
            loadGenreSection();
        }
        // --- Logic for video-player.html ---
        else if (currentPagePath.includes('video-player.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            const animeTitle = urlParams.get('title');
            const episodeNum = urlParams.get('ep');

            if (animeTitle && episodeNum) {
                const anime = window.getAnimeByTitle(decodeURIComponent(animeTitle));
                if (anime) {
                    displayVideoPlayerDetails(anime, episodeNum); // This is now handled in components.js
                } else {
                    const videoPlayerSection = document.getElementById('videoPlayerSection');
                    if (videoPlayerSection) {
                        videoPlayerSection.innerHTML = '<p style="text-align: center; color: var(--muted-text);">Anime not found for playback.</p>';
                    }
                }
            } else {
                const videoPlayerSection = document.getElementById('videoPlayerSection');
                if (videoPlayerSection) {
                    videoPlayerSection.innerHTML = '<p style="text-align: center; color: var(--muted-text);">Please select an anime episode to watch.</p>';
                }
            }
            loadNewSeriesSection();
            loadGenreSection();
        }
         else if (currentPagePath.includes('list.html')) {
          loadNewSeriesSection();
            loadGenreSection();  
         }
    })
    .catch(error => {
        const mainContent = document.getElementById('mainContent'); // Fallback for any page
        if (mainContent) {
            mainContent.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">
                Error loading anime data. Please try refreshing.
                Ensure your backend server is running at https://animezones-64tp.onrender.com.
            </p>`;
        }
    });

// --- Header/Nav Related Functions ---

// Function to toggle mobile menu visibility
function toggleMenu() {
    const links = document.getElementById('navLinks');
    links.classList.toggle('show');
}

// Function to toggle search box visibility and manage content display
function toggleSearchBox() {
    const box = document.getElementById('searchBox');
    const mainContent = document.getElementById('mainContent');
    const searchResultsSection = document.getElementById('searchResultsSection');
    const allAnimePagination = document.querySelector('.all-anime-section .pagination');

    if (box) {
        if (box.style.display === 'block') {
            box.style.display = 'none';
            document.getElementById('searchInput').value = '';

            if (mainContent) mainContent.style.display = '';
            if (searchResultsSection) searchResultsSection.style.display = 'none';

            if (window.location.pathname.includes('all-anime.html') && typeof displayCurrentPage === 'function' && typeof window.allAnimeList !== 'undefined') {
                currentPage = 1;
                filteredAnimeList = [...window.allAnimeList];
                displayCurrentPage(filteredAnimeList);
                if (allAnimePagination) allAnimePagination.style.display = 'flex';
            } else {
                const latestAnimeSection = document.getElementById('latestAnimeSection');
                const latestAnimeNextButton = document.getElementById('latestAnimeNextButton');
                const recommendationSection = document.getElementById('recommendationSection');
                const genreSection = document.getElementById('genreSection');
                const seasonSection = document.getElementById('seasonSection');

                if (latestAnimeSection) latestAnimeSection.style.display = 'block';
                if (latestAnimeNextButton) latestAnimeNextButton.style.display = 'flex';
                if (recommendationSection) recommendationSection.style.display = 'block';
                if (genreSection) genreSection.style.display = 'block';
                if (seasonSection) seasonSection.style.display = 'block';
            }

        } else {
            box.style.display = 'block';
            document.getElementById('searchInput').focus();

            if (mainContent) mainContent.style.display = 'none';
            if (searchResultsSection) {
                searchResultsSection.style.display = 'block';
                searchResultsSection.querySelector('h2').textContent = `Search Results`;
                searchResultsContainer.innerHTML = '';
            }
            if (allAnimePagination) allAnimePagination.style.display = 'none';
            filterAnime();
        }
    }
}

// Function to toggle light/dark theme
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');

    body.classList.toggle('light');

    if (body.classList.contains('light')) {
        localStorage.setItem('theme', 'light');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    } else {
        localStorage.setItem('theme', 'dark');
        if (themeIcon) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }
}

// Function to apply saved theme on page load
function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('themeIcon');
    if (savedTheme === 'light') {
        document.body.classList.add('light');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    } else {
        document.body.classList.remove('light');
        if (themeIcon) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }
}

// --- Global Search Functionality ---
function filterAnime() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput || typeof window.allAnimeList === 'undefined') return;

    const searchText = searchInput.value.toLowerCase();
    const mainContent = document.getElementById('mainContent');
    const searchResultsSection = document.getElementById('searchResultsSection');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const allAnimePagination = document.querySelector('.all-anime-section .pagination');


    if (!mainContent || !searchResultsSection || !searchResultsContainer) return;

    if (searchText.length > 0) {
        mainContent.style.display = 'none';
        searchResultsSection.style.display = 'block';
        searchResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        searchResultsSection.querySelector('h2').textContent = `Search Results for "${searchText}"`;
        searchResultsContainer.innerHTML = '';
        if (allAnimePagination) allAnimePagination.style.display = 'none';

        const results = window.allAnimeList.filter(anime =>
            anime.title.toLowerCase().includes(searchText) ||
            (Array.isArray(anime.genre) && anime.genre.some(g => g.toLowerCase().includes(searchText))) ||
            (typeof anime.genre === 'string' && anime.genre.toLowerCase().includes(searchText))
        );

        if (results.length > 0) {
            results.forEach(anime => {
                const link = document.createElement('a');
                link.href = `anime-detail.html?title=${encodeURIComponent(anime.title)}`;
                link.style.textDecoration = 'none';
                link.style.color = 'inherit';

                const statusText = getAnimeStatus(anime.title);
                const statusClass = statusText === "Complete" ? "complete" : "ongoing";

                const card = document.createElement('div');
                card.className = 'anime-card';
                card.innerHTML = `
                    <img src="${anime.img}" alt="${anime.title}">
                    <div class="anime-info">
                        <div class="anime-title">${anime.title}</div>
                        <div class="status-episode ${statusClass}">${statusText} | ${anime.totalEpisodes || 'N/A'} Eps</div>
                        <div class="genre">${Array.isArray(anime.genre) ? anime.genre.join(', ') : (anime.genre || 'N/A')}</div>
                    </div>
                `;
                link.appendChild(card);
                searchResultsContainer.appendChild(link);
            });
        } else {
            searchResultsContainer.innerHTML = '<p style="color: var(--muted-text); text-align: center; padding: 20px;">No results found.</p>';
        }
    } else {
        mainContent.style.display = '';
        searchResultsSection.style.display = 'none';
        if (allAnimePagination) allAnimePagination.style.display = 'flex';

        if (window.location.pathname.includes('all-anime.html') && typeof currentPage !== 'undefined' && typeof displayCurrentPage === 'function' && typeof window.allAnimeList !== 'undefined') {
            currentPage = 1;
            filteredAnimeList = [...window.allAnimeList];
            displayCurrentPage(filteredAnimeList);
        } else {
            const latestAnimeSection = document.getElementById('latestAnimeSection');
            const latestAnimeNextButton = document.getElementById('latestAnimeNextButton');
            const recommendationSection = document.getElementById('recommendationSection');
            const genreSection = document.getElementById('genreSection');
            const seasonSection = document.getElementById('seasonSection');

            if (latestAnimeSection) latestAnimeSection.style.display = 'block';
            if (latestAnimeNextButton) latestAnimeNextButton.style.display = 'flex';
            if (recommendationSection) recommendationSection.style.display = 'block';
            if (genreSection) genreSection.style.display = 'block';
            if (seasonSection) seasonSection.style.display = 'block';
        }
    }
}


// --- New Function: Filter Anime by Genre (Global) ---
window.filterAnimeByGenre = function(selectedGenre) {
    const mainContent = document.getElementById('mainContent');
    const searchResultsSection = document.getElementById('searchResultsSection');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const allAnimePagination = document.querySelector('.all-anime-section .pagination');


    if (!mainContent || !searchResultsSection || !searchResultsContainer || typeof window.allAnimeList === 'undefined') return;
    mainContent.style.display = 'none';

    searchResultsSection.style.display = 'block';
    searchResultsSection.querySelector('h2').textContent = `Anime in Genre: "${selectedGenre}"`;
    searchResultsContainer.innerHTML = '';
    if (allAnimePagination) allAnimePagination.style.display = 'none';

    const normalizedSelectedGenre = selectedGenre;

    const filteredAnime = window.allAnimeList.filter(anime =>
        (Array.isArray(anime.genre) && anime.genre.includes(selectedGenre)) ||
        (typeof anime.genre === 'string' && anime.genre === selectedGenre)
    );
    if (filteredAnime.length > 0) {
        filteredAnime.forEach(anime => {
            const link = document.createElement('a');
            link.href = `anime-detail.html?title=${encodeURIComponent(anime.title)}`;
            link.style.textDecoration = 'none';
            link.style.color = 'inherit';

            const statusText = getAnimeStatus(anime.title);
            const statusClass = statusText === "Complete" ? "complete" : "ongoing";

            const card = document.createElement('div');
            card.className = 'anime-card';
            card.innerHTML = `
                <img src="${anime.img}" alt="${anime.title}">
                <div class="anime-info">
                    <div class="anime-title">${anime.title}</div>
                    <div class="status-episode ${statusClass}">${statusText} | ${anime.totalEpisodes || 'N/A'} Eps</div>
                    <div class="genre">${Array.isArray(anime.genre) ? anime.genre.join(', ') : (anime.genre || 'N/A')}</div>
                </div>
                `;
            link.appendChild(card);
            searchResultsContainer.appendChild(link);
        });
    } else {
        searchResultsContainer.innerHTML = `<p style="color: var(--muted-text); text-align: center; padding: 20px;">No anime found for genre: "${selectedGenre}".</p>`;
    }
};

// --- Setup Functions to attach Event Listeners ---
function setupSearchFunctionality() {
    const searchIcon = document.querySelector('.header-bar .icon-button:first-of-type');
    const searchInput = document.getElementById('searchInput');

    if (searchIcon) {
        searchIcon.addEventListener('click', toggleSearchBox);
    } else {
    }
    if (searchInput) {
        searchInput.addEventListener('keyup', filterAnime);
    } else {
    }
}

function setupMenuToggle() {
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    } else {
    }
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('themeIcon');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    } else {
    }
}

// Functions for pagination buttons on all-anime.html page
function setupAllAnimePageListeners() {
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    if (prevBtn) prevBtn.addEventListener('click', prevPage);
    if (nextBtn) nextBtn.addEventListener('click', nextPage);
}


// --- Main Component Loading Function ---
async function loadComponents() {
    try {
        const headerResponse = await fetch('header.html');
        if (!headerResponse.ok) throw new Error(`HTTP error! status: ${headerResponse.status} for header.html`);
        const headerHtml = await headerResponse.text();
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            headerPlaceholder.innerHTML = headerHtml;
        } else {
        }

        const navResponse = await fetch('nav.html');
        if (!navResponse.ok) throw new Error(`HTTP error! status: ${navResponse.status} for nav.html`);
        const navHtml = await navResponse.text();
        const navPlaceholder = document.getElementById('nav-placeholder');
        if (navPlaceholder) {
            navPlaceholder.innerHTML = navHtml;
        } else {
        }

        const footerResponse = await fetch('footer.html');
        if (!footerResponse.ok) throw new Error(`HTTP error! status: ${footerResponse.status} for footer.html`);
        const footerHtml = await footerResponse.text();
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            footerPlaceholder.innerHTML = footerHtml;
        } else {
          
        }

        // Important: Attach event listeners AFTER components are loaded
        applySavedTheme();
        setupSearchFunctionality();
        setupMenuToggle();
        setupThemeToggle();
    } catch (error) {
        const body = document.body;
        if (body) {
            body.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">
                Error loading essential parts of the page. Please try refreshing.
                If the problem persists, ensure you are running a local web server (e.g., Python's http.server).
            </p>`;
        }
    }
}

// Call loadComponents when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  loadComponents();
  loadNewSeriesSection();
  loadGenreSection();   displayCurrentPage(new Array(itemsPerPage).fill({}));
});
