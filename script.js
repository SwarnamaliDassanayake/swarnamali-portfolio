// ================= SCROLL MAIN SECTIONS LOGIC =================
const links = document.querySelectorAll(".navbar a");
const sections = document.querySelectorAll(".sections section");

window.addEventListener("DOMContentLoaded", () => {

    // ✅ Default section = Home (Hero)
    sections.forEach(sec => sec.classList.remove("active"));
    document.getElementById("home").classList.add("active");

    // ✅ Default navbar active = Home link
    links.forEach(l => l.classList.remove("active"));
    document.querySelector('.navbar a[href="#home"]').classList.add("active");
});

links.forEach(link => {
    link.addEventListener("click", function (e) {
        e.preventDefault();

        const targetId = this.getAttribute("href").substring(1);

        // remove active from all sections + links
        sections.forEach(sec => sec.classList.remove("active"));
        links.forEach(l => l.classList.remove("active"));

        // activate selected
        document.getElementById(targetId).classList.add("active");
        this.classList.add("active");
    });
});

document.getElementById("hireMeBtn").addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = "contact";

    // remove active from all sections + links
    sections.forEach(sec => sec.classList.remove("active"));
    links.forEach(l => l.classList.remove("active"));

    // activate contact section
    document.getElementById(targetId).classList.add("active");

    // update navbar active if exists
    const navLink = document.querySelector('.navbar a[href="#contact"]');
    if (navLink) navLink.classList.add("active");

    // scroll smoothly
    document.getElementById(targetId).scrollIntoView({
        behavior: "smooth"
    });
});

// ================= SWITCH PROJECT SECTIONs LOGIC =================
const tabs = document.querySelectorAll(".tab-btn");
const panels = document.querySelectorAll(".tab-panel");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {

        tabs.forEach(t => t.classList.remove("active"));
        panels.forEach(p => p.classList.remove("active"));

        tab.classList.add("active");
        document.getElementById(tab.dataset.tab).classList.add("active");
    });
});

const categoryCards = document.querySelectorAll(".category-card");
const projectSections = document.querySelectorAll(".section");

categoryCards.forEach(card => {
    card.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = this.getAttribute("href").substring(1);
        projectSections.forEach(sec => sec.classList.remove("active"));
        document.getElementById(targetId).classList.add("active");
        document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
    });
});


const backButtons = document.querySelectorAll(".back-btn");
const allSections = document.querySelectorAll(".sections section");

backButtons.forEach(button => {
    button.addEventListener("click", (e) => {
        e.preventDefault();

        // ❌ hide all sections
        allSections.forEach(sec => sec.classList.remove("active"));

        // ✅ show projects section
        const projects = document.getElementById("projects");
        projects.classList.add("active");

        // ✅ scroll
        projects.scrollIntoView({ behavior: "smooth" });

        // (optional) update navbar active state
        document.querySelectorAll(".navbar a").forEach(l => l.classList.remove("active"));
        document.querySelector('.navbar a[href="#projects"]').classList.add("active");
    });
});

// ================= CAROUSEL LOGIC =================
function initCarousel(carousel) {

    const track = carousel.querySelector(".carousel-track");
    const images = carousel.querySelectorAll("img");
    const indicatorContainer = carousel.querySelector(".carousel-indicators");
    const imageName = carousel.querySelector(".image-name");

    const prevBtn = carousel.querySelector(".prev-btn");
    const nextBtn = carousel.querySelector(".next-btn");

    if (!track || !indicatorContainer) return;

    // ================= REMOVE OLD INDICATORS =================
    indicatorContainer.querySelectorAll(".indicator").forEach(el => el.remove());

    // ================= CREATE INDICATORS =================
    images.forEach((img, i) => {
        const dot = document.createElement("span");
        dot.classList.add("indicator");

        if (i === 0) dot.classList.add("active");

        indicatorContainer.insertBefore(dot, imageName);

        // click event
        dot.addEventListener("click", () => {
            scrollToIndex(track, i);
            updateUI(indicatorContainer, imageName, images, i, prevBtn, nextBtn);
        });
    });

    // ================= PREV BUTTON =================
    prevBtn?.addEventListener("click", () => {
        const index = getIndex(track);
        const newIndex = Math.max(index - 1, 0);

        scrollToIndex(track, newIndex);
        updateUI(indicatorContainer, imageName, images, newIndex, prevBtn, nextBtn);
    });

    // ================= NEXT BUTTON =================
    nextBtn?.addEventListener("click", () => {
        const index = getIndex(track);
        const newIndex = Math.min(index + 1, images.length - 1);

        scrollToIndex(track, newIndex);
        updateUI(indicatorContainer, imageName, images, newIndex, prevBtn, nextBtn);
    });

    // ================= SCROLL SYNC =================
    track.addEventListener("scroll", () => {
        const index = getIndex(track);
        updateUI(indicatorContainer, imageName, images, index, prevBtn, nextBtn);
    });

    // ================= INITIAL STATE =================
    updateUI(indicatorContainer, imageName, images, 0, prevBtn, nextBtn);
}


// ================= CAROUSEL HELPERS =================
function getIndex(track) {
    return Math.round(track.scrollLeft / track.clientWidth);
}

function scrollToIndex(track, index) {
    track.scrollTo({
        left: track.clientWidth * index,
        behavior: "smooth"
    });
}


// ================= UI UPDATE =================
function updateUI(indicatorContainer, imageName, images, index, prevBtn, nextBtn) {

    const dots = indicatorContainer.querySelectorAll(".indicator");

    // ================= INDICATORS =================
    dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
    });

    // ================= IMAGE NAME =================
    if (images[index] && imageName) {
        imageName.textContent = images[index].alt;
    }

    // ================= NAV BUTTON LOGIC =================

    // If only one image → hide both
    if (images.length <= 1) {
        if (prevBtn) prevBtn.style.display = "none";
        if (nextBtn) nextBtn.style.display = "none";
        return;
    }

    // First item → only Next
    if (index === 0) {
        if (prevBtn) prevBtn.style.display = "none";
        if (nextBtn) nextBtn.style.display = "flex";
    }

    // Last item → only Prev
    else if (index === images.length - 1) {
        if (prevBtn) prevBtn.style.display = "flex";
        if (nextBtn) nextBtn.style.display = "none";
    }

    // Middle items → both
    else {
        if (prevBtn) prevBtn.style.display = "flex";
        if (nextBtn) nextBtn.style.display = "flex";
    }
}


// ================= RESET =================
function resetCarousel(carousel) {
    const track = carousel.querySelector(".carousel-track");
    if (track) track.scrollTo({ left: 0, behavior: "smooth" });
}


// ================= FULLSCREEN LOGIC =================
function initFullscreen(card) {

    const media = card.querySelector(".project-media");
    if (!media) return;

    const openBtn = media.querySelector(".img-expand-btn");
    const closeBtn = media.querySelector(".close-expand-btn");

    const section = card.closest(".section");
    const fullscreenContainer = section.querySelector(".media-fullscreen");

    if (!openBtn || !closeBtn || !fullscreenContainer) return;

    let originalParent = null;
    let nextSibling = null;

    // ================= OPEN =================
    openBtn.addEventListener("click", () => {

        originalParent = media.parentNode;
        nextSibling = media.nextSibling;

        fullscreenContainer.classList.add("active");
        fullscreenContainer.appendChild(media);

        openBtn.style.display = "none";
        closeBtn.style.display = "flex";
    });

    // ================= CLOSE =================
    closeBtn.addEventListener("click", () => {

        fullscreenContainer.classList.remove("active");

        if (nextSibling) {
            originalParent.insertBefore(media, nextSibling);
        } else {
            originalParent.appendChild(media);
        }

        openBtn.style.display = "flex";
        closeBtn.style.display = "none";
    });
}

// ================= FOOTER ADMIN LINK FIX =================
document.addEventListener("DOMContentLoaded", () => {

    const adminLink = document.querySelector(".copyright a[href='admin.html']");

    if (adminLink) {

        adminLink.addEventListener("click", function (e) {
            e.stopPropagation(); // prevent navbar / other handlers

            // GitHub Pages safe navigation
            const basePath = "/swarnamali-portfolio/";

            window.location.href = basePath + "admin.html";
        });
    }
});
