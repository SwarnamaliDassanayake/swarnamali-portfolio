// ================= FIREBASE HELPER =================
function cleanKey(text) {
    return text.replace(/[.#$/\[\]]/g, "_");
}

// ================= LOGIN =================
// ================= LOGIN =================
async function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const errorBox = document.getElementById("error");
    errorBox.innerText = "";

    try {
        const snapshot = await db.ref("general/settings").once("value");
        const data = snapshot.val();

        console.log("Firebase login data:", data);

        // Check system data exists
        if (!data) {
            errorBox.innerText = "System not configured!";
            return;
        }

        // SAFE STRING CONVERSION (fix trim errors)
        const correctEmail = String(data.mail ?? "").trim();
        const correctPassword = String(data.password ?? "").trim();

        // Basic validation
        if (!correctEmail || !correctPassword) {
            errorBox.innerText = "Login credentials missing in database!";
            return;
        }

        let emailError = "";
        let passwordError = "";

        // EMAIL CHECK
        if (email !== correctEmail) {
            emailError = "Invalid email";
        }

        // PASSWORD CHECK
        if (password !== correctPassword) {
            passwordError = "Invalid password";
        }

        // SHOW ERRORS
        if (emailError || passwordError) {
            errorBox.innerText = [emailError, passwordError]
                .filter(Boolean)
                .join(" | ");
            return;
        }

        // SUCCESS LOGIN
        document.getElementById("loginOverlay").style.display = "none";
        document.getElementById("admin").style.display = "block";

        console.log("Login successful!");

    } catch (err) {
        console.error("Login error:", err);
        errorBox.innerText = "Login failed. Try again!";
    }
}
// ================= GLOBAL ARRAYS =================
let features = [];
let technologies = [];

let currentCVUrl = "";
let currentProfileImageUrl = "";

// ================= CLOUDINARY =================
async function uploadToCloudinary(file, folder) {

    const isVideo = file.type.startsWith("video");

    const url = isVideo
        ? "https://api.cloudinary.com/v1_1/du7vc1tlu/video/upload"
        : "https://api.cloudinary.com/v1_1/du7vc1tlu/image/upload";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "portfolio_upload");
    formData.append("folder", folder);

    const res = await fetch(url, {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    if (!data.secure_url) throw new Error("Upload failed");

    return data;
}

// ================= GENERAL SETTINGS SAVE =================
document
    .getElementById("saveGeneralSettings")
    .addEventListener("click", saveGeneralSettings);

async function saveGeneralSettings() {

    const profileImage = document.getElementById("profileImage").files[0];

    const cvFile = document.getElementById("cvFile").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();
    const facebook = document.getElementById("facebook").value.trim();
    const linkedin = document.getElementById("linkedin").value.trim();
    const github = document.getElementById("github").value.trim();
    const mail = document.getElementById("adminMail").value.trim();
    const password = document.getElementById("adminPassword").value;

    let imageUrl = currentProfileImageUrl;

    try {

        if (profileImage) {
            const imgRes = await uploadToCloudinary(
                profileImage,
                "portfolio_upload/profile"
            );

            imageUrl = imgRes.secure_url;
        }

    } catch (err) {
        console.error(err);
        alert("❌ Cloudinary Upload Failed!");
        return;
    }

    await db.ref("general/settings").set({
        profileImage: imageUrl,
        cvFile,
        whatsapp,
        facebook,
        linkedin,
        github,
        mail,
        password,
        updatedAt: new Date().toISOString()
    });

    currentProfileImageUrl = imageUrl;

    alert("✅ GENERAL SETTINGS SAVED SUCCESSFULLY");
    loadGeneralSettingsToUI();
}

// ================= CV MODAL SYSTEM =================
function openCV() {
    if (!currentCVUrl) {
        alert("No CV found!");
        return;
    }

    const frame = document.getElementById("cvFrame");
    frame.src = convertToEmbedUrl(currentCVUrl);

    document.getElementById("cvModal").style.display = "block";
}

function closeCV() {
    document.getElementById("cvModal").style.display = "none";
    document.getElementById("cvFrame").src = "";
}

function convertToEmbedUrl(url) {
    if (!url) return "";

    if (url.includes("drive.google.com/file/d/")) {
        const fileId = url.match(/\/d\/(.*?)\//)?.[1];
        if (fileId) {
            return `https://drive.google.com/file/d/${fileId}/preview`;
        }
    }

    return url;
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("closeCV").addEventListener("click", closeCV);
});

// ================= LOAD GENERAL SETTINGS =================
function loadGeneralSettingsToUI() {

    db.ref("general/settings").once("value")
        .then(snapshot => {

            const data = snapshot.val();
            if (!data) return;

            document.getElementById("cvFile").value = data.cvFile || "";
            document.getElementById("whatsapp").value = data.whatsapp || "";
            document.getElementById("facebook").value = data.facebook || "";
            document.getElementById("linkedin").value = data.linkedin || "";
            document.getElementById("github").value = data.github || "";
            document.getElementById("adminMail").value = data.mail || "";
            document.getElementById("adminPassword").value = data.password || "";

            document.getElementById("profilePreview").src = data.profileImage || "";

            currentProfileImageUrl = data.profileImage || "";
            currentCVUrl = data.cvFile || "";

            const btn = document.getElementById("openCVBtn");
            if (btn) {
                btn.disabled = !currentCVUrl;
                btn.onclick = openCV;
            }

            document.getElementById("lastupdated").innerText =
                "Last Updated: " + (data.updatedAt || "N/A");
        })
        .catch(err => console.error(err));
}

window.addEventListener("load", loadGeneralSettingsToUI);

// ================= PROJECT SAVE =================
async function saveProject() {

    const title = document.getElementById("title").value.trim();
    const category = document.getElementById("category").value.trim();
    const subtitle = document.getElementById("subtitle").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!title || !category) {
        alert("Title and Category required!");
        return;
    }

    const folder = `portfolio_upload/${category}/${title}`;

    let demoData = [];

    try {

        const demoBlocks = document.querySelectorAll("#demoContainer > div");

        let totalFiles = 0;
        let uploadedFiles = 0;

        demoBlocks.forEach(block => {
            block.querySelectorAll(".demoFileContainer div").forEach(row => {
                const file = row.querySelector(".demoFileUpload")?.files[0];
                if (file) totalFiles++;
            });
        });

        for (let block of demoBlocks) {

            const previewName = block.querySelector(".demoPreviewInput")?.value || "";
            const files = [];

            const fileRows = block.querySelectorAll(".demoFileContainer div");

            for (let row of fileRows) {

                const name = row.querySelector(".demoFileName")?.value || "";
                const file = row.querySelector(".demoFileUpload")?.files[0];

                if (file) {

                    const res = await uploadToCloudinary(file, folder);

                    uploadedFiles++;
                    const percent = totalFiles
                        ? Math.round((uploadedFiles / totalFiles) * 100)
                        : 100;

                    document.title = `Uploading... ${percent}%`;

                    files.push({
                        name,
                        url: res.secure_url,
                        type: file.type
                    });
                }
            }

            demoData.push({ previewName, files });
        }

    } catch (err) {
        console.error(err);
        alert("Upload failed!");
        return;
    }

    let featuresObj = {};
    features.forEach((f, i) => featuresObj[`feature_${i + 1}`] = f);

    let techObj = {};
    technologies.forEach((t, i) => techObj[`tech_${i + 1}`] = t);

    let demoObj = {};

    demoData.forEach(demo => {
        let fileObj = {};
        demo.files.forEach(file => {
            fileObj[file.name || "file"] = file.url;
        });
        demoObj[demo.previewName || "untitled"] = fileObj;
    });

    const safeCategory = cleanKey(category);
    const safeTitle = cleanKey(title);

    await db.ref(`projects/${safeCategory}/${safeTitle}`).set({
        subtitle,
        description,
        features: featuresObj,
        technologies: techObj,
        demo: demoObj,
        createdAt: new Date().toISOString()
    });

    alert("✅ PROJECT SAVED SUCCESSFULLY");

    features = [];
    technologies = [];

    document.getElementById("featureList").innerHTML = "";
    document.getElementById("techList").innerHTML = "";
    document.getElementById("demoContainer").innerHTML = "";
    document.getElementById("projectForm").reset();
}
