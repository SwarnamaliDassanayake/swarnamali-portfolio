// ================= FIREBASE CONFIG =================
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

// ================= SETTINGS =================
loadGeneralSettings();

async function loadGeneralSettings() {
  try {
    const snapshot = await get(ref(db, "general/settings"));

    if (!snapshot.exists()) return;

    const settings = snapshot.val();

    // Hero image
    if (settings.profileImage) {
      document.getElementById("heroImage").src = settings.profileImage;
    }

    // CV download
    if (settings.cvFile) {
      document.getElementById("downloadResumeBtn").href = settings.cvFile;
    }

    // Helper function to update all links of same type
    function setLinks(selector, value) {
      document.querySelectorAll(selector).forEach(el => {
        el.href = value;
      });
    }

    // Social links (ALL instances)
    if (settings.whatsapp) {
      setLinks(".whatsappBtn", settings.whatsapp);
    }

    if (settings.github) {
      setLinks(".githubBtn", settings.github);
    }

    if (settings.linkedin) {
      setLinks(".linkedinBtn", settings.linkedin);
    }

    if (settings.facebook) {
      setLinks(".facebookBtn", settings.facebook);
    }

  } catch (error) {
    console.error("Settings Load Error:", error);
  }
}

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

// ================= GRID MAP (projects) =================
const gridMap = {
  "UI Design": document.getElementById("uiGrid"),
  "Web App": document.getElementById("webGrid"),
  "Software System": document.getElementById("softwareGrid"),
  "Robotics": document.getElementById("roboticsGrid"),
  "Mobile App": document.getElementById("mobileGrid"),
  "Database": document.getElementById("databaseGrid")
};

// ================= FETCH DATA (projects) =================
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


// ================= CREATE PROJECT CARD =================
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

// ================= INIT PROJECT CARD =================
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

// ================= SKILLS =================
loadSkills();

async function loadSkills() {
  try {
    const snapshot = await get(ref(db, "skills"));

    if (!snapshot.exists()) return;

    const skills = snapshot.val();

    const skillMap = {
      "Tools": "tools",
      "UI Design": "frontEnd",
      "Backend": "backend",
      "Database": "db",
      "Smart Dev": "smartDev"
    };

    Object.entries(skillMap).forEach(([folder, cardId]) => {

      const ul = document.querySelector(`#${cardId} ul`);
      if (!ul || !skills[folder]) return;

      // Clear only the <ul>
      ul.innerHTML = "";

      Object.entries(skills[folder]).forEach(([skill, level]) => {

        const li = document.createElement("li");

        li.innerHTML = `
          <span class="skill-text">
            <span class="material-icons">chevron_right</span>
            ${skill}
          </span>

          <div class="progress-box">
            <div class="progress-bar" style="width:${level};"></div>
            <span class="progress-text">${level}</span>
          </div>
        `;

        ul.appendChild(li);
      });

    });

  } catch (error) {
    console.error("Skills Load Error:", error);
  }
}

// ================= EXPERIENCE =================
loadExperience();

async function loadExperience() {
  try {
    const snapshot = await get(ref(db, "exp"));

    if (!snapshot.exists()) {
      console.log("No experience found.");
      return;
    }

    const experiences = snapshot.val();
    const workGrid = document.getElementById("workGrid");

    workGrid.innerHTML = ""; // clear old content

    Object.entries(experiences).forEach(([jobKey, exp]) => {

      // Convert arrays/objects safely
      const technologies = exp.expTechnologies
        ? Object.values(exp.expTechnologies).map(t => `<li>${t}</li>`).join("")
        : "";

      const points = exp.expPoints
        ? Object.values(exp.expPoints).map(p => `<li>${p}</li>`).join("")
        : "";

      const article = document.createElement("article");
      article.className = "experience-card section-card";

      article.innerHTML = `
        <div class="experience-header">

          <div class="experience-title">
            <h4>${exp.expTitle || ""}</h4>

            <a href="${exp.expLink || "#"}" target="_blank" class="company-link">
              <span class="material-icons">language</span>
              <span>${exp.expCompany || ""}</span>
            </a>
          </div>

          <p class="year-range">
            ${exp.expYear || ""}
          </p>

        </div>

        <ul class="experience-tech">
          ${technologies}
        </ul>

        <ul class="experience-list">
          ${points}
        </ul>

        <p class="experience-note">
          ${exp.expDescription || ""}
        </p>
      `;

      workGrid.appendChild(article);
    });

  } catch (error) {
    console.error("Experience Load Error:", error);
  }
}

// ================= EDUCATION =================
loadEducation();

async function loadEducation() {
  try {
    const snapshot = await get(ref(db, "edu"));

    if (!snapshot.exists()) {
      console.log("No education records found.");
      return;
    }

    const educations = snapshot.val();
    const educationGrid = document.getElementById("educationGrid");

    // Clear existing cards
    educationGrid.innerHTML = "";

    Object.entries(educations).forEach(([eduKey, edu]) => {

      const article = document.createElement("article");
      article.className = "education-card section-card";

      article.innerHTML = `
        <div class="education-card-header">

          <img
            src="${edu.eduImage || ""}"
            alt="${edu.eduTitle || ""}"
            class="education-image">

          <div>
            <h4>${edu.eduTitle || ""}</h4>

            <p class="education-institute">
              ${edu.eduInstitute || ""}
              <br>
              <span class="year-range">
                ${edu.eduYear || ""}
              </span>
            </p>
          </div>

        </div>

        <p class="education-description">
          ${edu.eduDescription || ""}
        </p>
      `;

      educationGrid.appendChild(article);

    });

  } catch (error) {
    console.error("Education Load Error:", error);
  }
}
