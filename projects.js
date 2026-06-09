import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDfehi3batpF-DlyvI-HVtJoBBooXuC8sc",
  authDomain: "portfolio-mali.firebaseapp.com",
  databaseURL: "https://portfolio-mali-default-rtdb.firebaseio.com",
  projectId: "portfolio-mali",
  storageBucket: "portfolio-mali.firebasestorage.app",
  messagingSenderId: "767019931608",
  appId: "1:767019931608:web:908407842d42c01bbb84ad"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ================= CLOUDINARY FIX =================
function fixCloudinaryVideo(url) {
  if (!url) return url;

  const clean = url.split("?")[0];

  if (clean.includes("/video/")) {
    return url.replace(
      "/upload/",
      "/upload/f_mp4,vc_h264,ac_aac/"
    );
  }

  return url;
}

// ================= GRID MAP =================
const gridMap = {
  "UI Design": document.getElementById("uiGrid"),
  "Web App": document.getElementById("webGrid"),
  "Software System": document.getElementById("softwareGrid"),
  "Robotics": document.getElementById("roboticsGrid"),
  "Mobile App": document.getElementById("mobileGrid"),
  "Database": document.getElementById("databaseGrid")
};

// ================= FETCH DATA =================
Object.keys(gridMap).forEach(category => {

  const categoryRef = ref(db, `projects/${category}`);

  get(categoryRef)
    .then(snapshot => {

      if (!snapshot.exists()) return;

      const projects = snapshot.val();
      const grid = gridMap[category];

      Object.entries(projects).forEach(([projectName, data]) => {

        data.category = category;

        const card = createProjectCard(projectName, data);

        grid.appendChild(card);
        initProjectCard(card);
      });

    })
    .catch(console.error);
});


// ================= CREATE CARD =================
function createProjectCard(title, data) {

  const card = document.createElement("div");
  card.className = "project-card section-card";

  const subtitle = data.subtitle || "";
  const description = data.description || "";

  const features = data.features
    ? Object.values(data.features).map(f => `<li>${f}</li>`).join("")
    : "";

  const tech = data.technologies
    ? Object.values(data.technologies).map(t => `<li>${t}</li>`).join("")
    : "";

  const demos = data.demo || {};

  const safeId = title.replace(/\s+/g, "-");

  // ================= TABS =================
  const demoTabs = Object.keys(demos)
    .map((demoName, index) => `
      <button class="media-tab ${index === 0 ? "active" : ""}"
        data-target="${safeId}-demo-${index}">
        ${demoName}
      </button>
    `).join("");

  // ================= CAROUSELS =================
  const demoCarousels = Object.entries(demos)
    .map(([demoName, demoData], index) => {

      const mediaItems = Object.entries(demoData)
        .map(([mediaName, mediaUrl]) => {

          const isVideo =
            mediaUrl?.toLowerCase().includes("/video/") ||
            mediaUrl?.toLowerCase().endsWith(".mp4");

          return isVideo
            ? `
              <div class="media-video-wrapper">
                <video controls preload="metadata" playsinline>
                  <source src="${fixCloudinaryVideo(mediaUrl)}" type="video/mp4">
                </video>
              </div>
            `
            : `
              <img
                src="${mediaUrl}"
                alt="${mediaName}"
                data-name="${mediaName}"
                loading="lazy"
              >
            `;
        })
        .join("");

      const firstMediaName = Object.keys(demoData)[0] || "";

      return `
        <div class="media-carousel ${index === 0 ? "active" : ""}"
          id="${safeId}-demo-${index}">

          <button class="carousel-btn prev-btn">
            <span class="material-icons">chevron_left</span>
          </button>

          <div class="carousel-track">
            ${mediaItems}
          </div>

          <button class="carousel-btn next-btn">
            <span class="material-icons">chevron_right</span>
          </button>

          <div class="carousel-indicators">
            <p class="image-name">${firstMediaName}</p>
          </div>

        </div>
      `;
    }).join("");

  // ================= HTML =================
  card.innerHTML = `
    <h3><span>"${title}"</span> - ${subtitle}</h3>

    <div class="project-media">

      <div class="media-control">
        <div class="media-tabs">
          ${demoTabs}
        </div>

        <button class="img-expand-btn">
          <span class="material-icons">fullscreen</span>
        </button>

        <button class="close-expand-btn">
          <span class="material-icons">fullscreen_exit</span>
        </button>
      </div>

      ${demoCarousels}

    </div>

    <div class="project-description">

      <p>${description}</p>

      <div class="project-features">
        <h4>Features</h4>
        <ul>${features}</ul>
      </div>

      <div class="project-tech">
        <h4>Technologies</h4>
        <ul>${tech}</ul>
      </div>

    </div>
  `;

  return card;
}


// ================= INIT CARD =================
function initProjectCard(projectMedia) {

  const tabs = projectMedia.querySelectorAll(".media-tab");
  const carousels = projectMedia.querySelectorAll(".media-carousel");

  // ================= TAB SWITCH =================
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {

      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      carousels.forEach(c => c.classList.remove("active"));

      const target = tab.dataset.target;

      const active = Array.from(carousels)
        .find(c => c.id === target);

      if (!active) return;

      active.classList.add("active");

      const track = active.querySelector(".carousel-track");

      if (track) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      }

      resetCarousel(active);
    });
  });

  carousels.forEach(c => initCarousel(c));
  initFullscreen(projectMedia);
}

// ================= SETTINGS =================
loadGeneralSettings();

async function loadGeneralSettings() {
  try {

    const snapshot = await get(
      ref(db, "general/settings")
    );

    if (!snapshot.exists()) return;

    const settings = snapshot.val();

    // Hero Image
    if (settings.profileImage) {
      document.getElementById("heroImage").src =
        settings.profileImage;
    }

    // CV Download
    if (settings.cvFile) {
   document.getElementById("downloadResumeBtn").href =
      settings.cvFile;
         cvBtn.setAttribute("download", "Swarnamali_Dassanayake_CV.pdf");
    }

    // Social Links
    if (settings.whatsapp) {
      document.getElementById("whatsappBtn").href =
        settings.whatsapp;
    }

    if (settings.github) {
      document.getElementById("githubBtn").href =
        settings.github;
    }

    if (settings.linkedin) {
      document.getElementById("linkedinBtn").href =
        settings.linkedin;
    }

    if (settings.facebook) {
      document.getElementById("facebookBtn").href =
        settings.facebook;
    }

  } catch (error) {
    console.error("Settings Load Error:", error);
  }
}