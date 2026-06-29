// ================= FIREBASE HELPER =================
function cleanKey(text) {
    return text.replace(/[.#$/\[\]]/g, "_");
}

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

        loadProjectsToConsole();
        loadProjectsToTable();
        loadSkillsToTable();
        loadEducationTable();
        loadExperienceTable();

    } catch (err) {
        console.error("Login error:", err);
        errorBox.innerText = "Login failed. Try again!";
    }
}

// ================= GLOBAL ARRAYS =================
let features = [];
let technologies = [];
let expTechnologies = [];
let expPoints = [];

let currentCVUrl = "";
let currentProfileImageUrl = "";

// ================= ADD FEATURE =================
function addFeature() {
    const input = document.getElementById("featureInput");
    const value = input.value.trim();
    if (!value) return;

    features.push(value);

    const li = document.createElement("li");
    li.innerHTML = `
        <span>${value}</span>
        <button type="button" onclick="removeFeature(this, '${value}')">✕</button>
    `;

    document.getElementById("featureList").appendChild(li);
    input.value = "";
}

// ================= REMOVE FEATURE =================
function removeFeature(button, value) {
    features = features.filter(feature => feature !== value);
    button.parentElement.remove();
}

// ================= ADD PROJECT TECHNOLOGY =================
function addTech() {
    const input = document.getElementById("techInput");
    const value = input.value.trim();
    if (!value) return;

    technologies.push(value);

    const li = document.createElement("li");
    li.innerHTML = `
        <span>${value}</span>
        <button type="button" onclick="removeTech(this, '${value}')">✕</button>
    `;

    document.getElementById("techList").appendChild(li);
    input.value = "";
}

// ================= REMOVE PROJECT TECHNOLOGY =================
function removeTech(button, value) {
    technologies = technologies.filter(tech => tech !== value);
    button.parentElement.remove();
}

// ================= ADD DEMO BLOCK =================
function addDemo() {
    document.getElementById("demoContainer")
        .appendChild(createDemoBlock());
}

// ================= CREATE DEMO BLOCK =================
function createDemoBlock() {
    const block = document.createElement("div");
    block.style.border = "1px solid #ccc";
    block.style.padding = "10px";
    block.style.marginTop = "10px";

    block.innerHTML = `
        <input type="text" class="demoPreviewInput" placeholder="Preview name" style="width:80%; margin-bottom:8px;">
        <button type="button" onclick="removeDemo(this)">✕</button>

        <div class="demoFileContainer"></div>

        <div style="margin-top:10px;">
            <button type="button" onclick="addFileRow(this)">+ New File</button>
        </div>
    `;

    return block;
}

// ================= REMOVE DEMO BLOCK =================
function removeDemo(button) {
    button.closest("div").remove();
}

// ================= ADD FILE ROW =================
function addFileRow(btn) {
    const block = btn.closest("div").parentElement;
    const container = block.querySelector(".demoFileContainer");
    container.appendChild(createDemoFileRow());
}

// ================= CREATE FILE ROW =================
function createDemoFileRow() {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.gap = "10px";
    row.style.marginTop = "8px";
    row.style.alignItems = "center";

    row.innerHTML = `
        <input type="text" class="demoFileName" placeholder="File name" style="flex:1;">
        <input type="file" class="demoFileUpload" accept="image/*,video/*" style="flex:1;">
        <button type="button" onclick="removeFileRow(this)">✕</button>
    `;

    return row;
}

// ================= REMOVE FILE ROW =================
function removeFileRow(button) {
    button.closest("div").remove();
}

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
                btn.onclick = () => openPreviewModal(currentCVUrl);
            }

            document.getElementById("lastupdated").innerText =
                "Last Updated: " + (data.updatedAt || "N/A");
        })
        .catch(err => console.error(err));
}

window.addEventListener("load", loadGeneralSettingsToUI);

// ================= CLEAR PROJECT FORM =================
function clearProjectForm() {
    features = [];
    technologies = [];

    document.getElementById("featureList").innerHTML = "";
    document.getElementById("techList").innerHTML = "";
    document.getElementById("demoContainer").innerHTML = "";
    document.getElementById("projectForm").reset();

}

// ================= LOAD ALL PROJECTS =================
async function loadProjectsToConsole() {

    try {

        const snapshot = await db.ref("projects").once("value");

        if (!snapshot.exists()) {
            console.log("========== PROJECTS ==========");
            console.log("No projects found.");
            return;
        }

        const projects = snapshot.val();

        console.log("========== ALL PROJECTS ==========");
        console.log(projects);

        console.log(
            "========== JSON ==========\n",
            JSON.stringify(projects, null, 2)
        );

        Object.keys(projects).forEach(category => {

            console.log(
                `========== CATEGORY : ${category} ==========`
            );

            const categoryProjects = projects[category];

            Object.keys(categoryProjects).forEach(projectName => {

                console.log(
                    `PROJECT : ${projectName}`
                );

                console.log(
                    categoryProjects[projectName]
                );

            });

        });

    } catch (err) {

        console.error(
            "Error loading projects:",
            err
        );

    }

}

// ================= LOAD PROJECTS INTO TABLE =================
async function loadProjectsToTable() {

    try {

        const snapshot = await db.ref("projects").once("value");

        const container = document.getElementById("projectList");

        container.innerHTML = "";

        if (!snapshot.exists()) {
            container.innerHTML = "<p>No projects found.</p>";
            return;
        }

        const projects = snapshot.val();

        // Create table
        const table = document.createElement("table");

        // Table header
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");

        Object.keys(projects).forEach(category => {

            const categoryProjects = projects[category];

            Object.keys(categoryProjects).forEach(title => {

                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${title}</td>
                    <td>${category}</td>
                    <td>
                        <button onclick="editProject('${category}', '${title}')">
                            <span class="material-icons">edit</span>
                        </button>
                        <button onclick="deleteProject('${category}', '${title}')">
                            <span class="material-icons">delete</span>
                        </button>
                    </td>
                `;

                tbody.appendChild(row);

            });

        });

        container.appendChild(table);

    } catch (err) {
        console.error("Error loading table:", err);
    }
}

// ================= DELETE PROJECT =================
async function deleteProject(category, title) {

    const confirmDelete = confirm(`Delete "${title}" from ${category}?`);

    if (!confirmDelete) return;

    try {

        await db.ref(`projects/${category}/${title}`).remove();

        console.log("Deleted:", title);

        loadProjectsToTable();

    } catch (err) {
        console.error("Delete error:", err);
    }
}

// ================= EDIT PROJECT =================
async function editProject(category, title) {

    try {

        const snapshot = await db.ref(`projects/${category}/${title}`).once("value");
        const data = snapshot.val();

        if (!data) {
            alert("Project not found!");
            return;
        }

        // ================= BASIC =================
        document.getElementById("category").value = category;
        document.getElementById("title").value = title;
        document.getElementById("subtitle").value = data.subtitle || "";
        document.getElementById("description").value = data.description || "";

        // ================= RESET =================
        features = [];
        technologies = [];

        document.getElementById("featureList").innerHTML = "";
        document.getElementById("techList").innerHTML = "";
        document.getElementById("demoContainer").innerHTML = "";

        // ================= FEATURES =================
        if (data.features) {
            Object.values(data.features).forEach(f => {

                features.push(f);

                const li = document.createElement("li");
                li.innerHTML = `
                    <span>${f}</span>
                    <button type="button" onclick="removeFeature(this, '${f}')">
                        <span class="material-icons">close</span>
                    </button>
                `;

                document.getElementById("featureList").appendChild(li);
            });
        }

        // ================= TECHNOLOGIES =================
        if (data.technologies) {
            Object.values(data.technologies).forEach(t => {

                technologies.push(t);

                const li = document.createElement("li");
                li.innerHTML = `
                    <span>${t}</span>
                    <button type="button" onclick="removeTech(this, '${t}')">
                    <span class="material-icons">close</span>
                    </button>
                `;

                document.getElementById("techList").appendChild(li);
            });
        }

        // ================= DEMO  =================
        if (data.demo) {

            Object.keys(data.demo).forEach(demoKey => {

                const demoBlock = document.createElement("div");
                demoBlock.style.border = "1px solid var(--gray)";
                demoBlock.style.padding = "10px";
                demoBlock.style.marginTop = "10px";

                demoBlock.innerHTML = `
                    <input type="text"
                           class="demoPreviewInput"
                           value="${demoKey}">

                    <div class="demoFileContainer"></div>

                    <div>
                        <button type="button" onclick="addFileRow(this)">
                            <span class="material-icons">add</span>
                            File
                        </button>
                    </div>
                `;

                // Load Old Demo List
                const fileContainer = demoBlock.querySelector(".demoFileContainer");

                const files = data.demo[demoKey];

                Object.keys(files).forEach(fileKey => {

                    const row = document.createElement("div");
                    row.style.display = "flex";
                    row.style.gap = "10px";
                    row.style.marginTop = "8px";
                    row.style.alignItems = "center";

                    row.innerHTML = `
    <input type="text"
           class="demoFileName"
           value="${fileKey}"
           style="flex:1;">

   <a href="javascript:void(0)"
   class="demoFileLink"
   data-url="${files[fileKey]}"
   title="Open File"
   onclick="openPreviewModal('${files[fileKey]}')">

    <span class="material-icons">preview</span>

</a>
`;
                    fileContainer.appendChild(row);
                });

                document.getElementById("demoContainer").appendChild(demoBlock);
            });
        }

        console.log("PROJECT LOADED FOR EDIT:", data);

    } catch (err) {
        console.error("Edit error:", err);
    }
}

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

        // Count only NEW files
        demoBlocks.forEach(block => {
            block.querySelectorAll(".demoFileContainer > div").forEach(row => {
                const file = row.querySelector(".demoFileUpload")?.files[0];
                if (file) totalFiles++;
            });
        });

        // ================= DEMO =================
        for (const block of demoBlocks) {

            const previewName =
                block.querySelector(".demoPreviewInput")?.value.trim() || "untitled";

            let files = [];

            const fileRows = block.querySelectorAll(".demoFileContainer > div");

            for (const row of fileRows) {

                const name =
                    row.querySelector(".demoFileName")?.value.trim() || "file";

                const uploadInput = row.querySelector(".demoFileUpload");
                const newFile = uploadInput?.files[0];

                const previewLink = row.querySelector(".demoFileLink");

                // ================= NEW FILE =================
                if (newFile) {

                    const res = await uploadToCloudinary(newFile, folder);

                    uploadedFiles++;

                    const percent = totalFiles
                        ? Math.round((uploadedFiles / totalFiles) * 100)
                        : 100;

                    document.title = `Uploading... ${percent}%`;

                    files.push({
                        name: name,
                        url: res.secure_url
                    });

                }

                // ================= OLD FILE =================
                else if (previewLink && previewLink.dataset.url) {

                    files.push({
                        name: name,
                        url: previewLink.dataset.url
                    });

                }

            }

            demoData.push({
                previewName,
                files
            });

        }

    } catch (err) {

        console.error(err);
        alert("Upload failed!");
        return;

    }

    // ================= FEATURES =================
    let featuresObj = {};

    features.forEach((f, i) => {
        featuresObj[`feature_${i + 1}`] = f;
    });

    // ================= TECHNOLOGIES =================
    let techObj = {};

    technologies.forEach((t, i) => {
        techObj[`tech_${i + 1}`] = t;
    });

    // ================= DEMO OBJECT =================
    let demoObj = {};

    demoData.forEach(demo => {

        let fileObj = {};

        demo.files.forEach(file => {
            fileObj[file.name] = file.url;
        });

        demoObj[demo.previewName] = fileObj;

    });

    const safeCategory = cleanKey(category);
    const safeTitle = cleanKey(title);

    // ================= SAVE =================
    await db.ref(`projects/${safeCategory}/${safeTitle}`).set({

        subtitle,
        description,

        features: featuresObj,
        technologies: techObj,
        demo: demoObj,

        createdAt: new Date().toISOString()

    });

    document.title = "Admin";

    alert("✅ PROJECT SAVED SUCCESSFULLY");

    clearProjectForm();

    loadProjectsToTable();

}

// ================= RESET SKILL =================
function resetSkills() {
    document.getElementById("skillName").value = "";
    document.getElementById("skillLevel").value = "";
}

// ================= ADD SKILL =================
function addSkill() {

    const category = document.getElementById("skillCategory").value;
    const skillName = document.getElementById("skillName").value.trim();
    const skillLevel = document.getElementById("skillLevel").value.trim();

    if (!skillName || !skillLevel) {
        alert("Enter skill name and level");
        return;
    }

    alert(
        "Category : " + category +
        "\nSkill : " + skillName +
        "\nLevel : " + skillLevel + "%"
    );

    firebase.database()
        .ref("skills/" + category)
        .update({
            [skillName]: skillLevel + "%"
        })
        .then(() => {

            alert("Skill added successfully");

            resetSkills();
            loadSkillsToTable(); // refresh table

        })
        .catch(error => {
            alert(error.message);
        });
}

// ================= LOAD SKILLS INTO TABLE =================
async function loadSkillsToTable() {

    try {

        const snapshot = await firebase.database().ref("skills").once("value");

        const container = document.getElementById("skillList");

        // 🚨 FIX: prevent null crash
        if (!container) {
            console.error("skillList div not found in HTML!");
            return;
        }

        container.innerHTML = "";

        if (!snapshot.exists()) {
            container.innerHTML = "<p>No skills found.</p>";
            return;
        }

        const skills = snapshot.val();

        // Create table
        const table = document.createElement("table");

        table.innerHTML = `
    <thead>
        <tr>
            <th>Category</th>
            <th>Skill Name</th>
            <th>Level</th>
            <th>Action</th>
        </tr>
    </thead>
    <tbody></tbody>
`;

        const tbody = table.querySelector("tbody");

        Object.keys(skills || {}).forEach(category => {

            const categoryData = skills[category] || {};

            Object.keys(categoryData).forEach(skillName => {

                const row = document.createElement("tr");

                row.innerHTML = `
        <td>${category}</td>
        <td>${skillName}</td>
        <td>${categoryData[skillName]}</td>
        <td>
            <button onclick="deleteSkill('${category}', '${skillName}')">
                <span class="material-icons">delete</span>
            </button>
        </td>
    `;

                tbody.appendChild(row);
            });
        });

        container.appendChild(table);

    } catch (err) {
        console.error("Error loading skills:", err);
    }
}

// ================= DELETE SKILL =================
function deleteSkill(category, skillName) {

    const confirmDelete = confirm(
        `Delete "${skillName}" from ${category}?`
    );

    if (!confirmDelete) return;

    firebase.database()
        .ref(`skills/${category}/${skillName}`)
        .remove()
        .then(() => {

            alert("Skill deleted successfully");

            loadSkillsToTable(); // refresh table

        })
        .catch(err => {
            alert("Delete failed: " + err.message);
        });
}

// ================= EDUCATION IMAGE PREVIEW =================
document.getElementById("edu-image").addEventListener("change", function () {

    const file = this.files[0];
    const preview = document.getElementById("eduPreview");

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = "block";
    };

    reader.readAsDataURL(file);

});

// ================= SAVE EDUCATION =================
async function saveEducation() {

    const imageInput = document.getElementById("edu-image");
    const imageFile = imageInput.files[0];

    const preview = document.getElementById("eduPreview");

    const title = document.getElementById("edu-title").value.trim();
    const institute = document.getElementById("edu-institute").value.trim();
    const year = document.getElementById("edu-year").value.trim();
    const description = document.getElementById("edu-description").value.trim();

    if (!title || !institute || !year) {
        alert("Fill required fields!");
        return;
    }

    let imageUrl = "";

    // Upload new image
    if (imageFile) {

        const upload = await uploadToCloudinary(
            imageFile,
            "portfolio_upload/edu"
        );

        imageUrl = upload.secure_url;

    } else {

        // No new image selected -> keep existing image
        if (
            preview.src &&
            preview.src !== window.location.href &&
            !preview.src.startsWith("data:")
        ) {
            imageUrl = preview.src;
        }

    }

    const key = cleanKey(title);

    await db.ref(`edu/${key}`).set({
        eduTitle: title,
        eduImage: imageUrl,
        eduInstitute: institute,
        eduYear: year,
        eduDescription: description
    });

    alert("EDUCATION SAVED");

    clearEducationForm();
    loadEducationTable();
}

// ================= CLEAR EDUCATION =================
function clearEducationForm() {

    document.getElementById("edu-image").value = "";
    document.getElementById("edu-title").value = "";
    document.getElementById("edu-institute").value = "";
    document.getElementById("edu-year").value = "";
    document.getElementById("edu-description").value = "";

    const preview = document.getElementById("eduPreview");
    preview.src = "";
    preview.style.display = "none";
}

// ================= LOAD EDUCATION TABLE =================
async function loadEducationTable() {

    try {

        const snapshot = await db.ref("edu").once("value");

        const container = document.getElementById("educationList");

        container.innerHTML = "";

        if (!snapshot.exists()) {
            container.innerHTML = "<p>No education found.</p>";
            return;
        }

        const data = snapshot.val();

        // ================= CREATE TABLE =================
        const table = document.createElement("table");

        table.innerHTML = `
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Year</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");

        Object.keys(data).forEach(key => {

            const edu = data[key];

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${edu.eduTitle || ""}</td>
                <td>${edu.eduYear || ""}</td>
                <td>
                    <button onclick="editEducation('${key}')">
                        <span class="material-icons">edit</span>
                    </button>

                    <button onclick="deleteEducation('${key}')">
                        <span class="material-icons">delete</span>
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });

        container.appendChild(table);

    } catch (err) {
        console.error("Education load error:", err);
    }
}

function deleteEducation(key) {

    const confirmDelete = confirm("Delete this education?");

    if (!confirmDelete) return;

    db.ref(`edu/${key}`).remove()
        .then(() => {
            alert("Deleted successfully");
            loadEducationTable();
        })
        .catch(err => {
            alert(err.message);
        });
}

async function editEducation(key) {

    const snapshot = await db.ref(`edu/${key}`).once("value");
    const data = snapshot.val();

    if (!data) {
        alert("Education not found");
        return;
    }

    // fill form
    document.getElementById("edu-title").value = data.eduTitle || "";
    document.getElementById("edu-institute").value = data.eduInstitute || "";
    document.getElementById("edu-year").value = data.eduYear || "";
    document.getElementById("edu-description").value = data.eduDescription || "";

    // store image preview (optional)
    const preview = document.getElementById("eduPreview");
    if (data.eduImage) {
        preview.src = data.eduImage;
        preview.style.display = "block";
    }

    // store key for update mode
    window.editEduKey = key;

    alert("Now update and click SAVE again");
}

// ================= ADD EXPERIENCE TECHNOLOGY =================
function addTechnology() {
    const input = document.getElementById("exp-tech");
    const value = input.value.trim();

    if (!value) return;

    expTechnologies.push(value);

    const item = document.createElement("div");
    item.className = "tag-item";

    item.innerHTML = `
        <span>${value}</span>
        <button type="button" onclick="removeTech(this, '${value}')">✕</button>
    `;

    document.getElementById("technologyList").appendChild(item);

    input.value = "";
}

// ================= REMOVE EXPERIENCE TECHNOLOGY =================
function removeTech(button, value) {
    expTechnologies = expTechnologies.filter(tech => tech !== value);
    button.parentElement.remove();
}

// ================= ADD EXPERIENCE POINT =================
function addExperiencePoint() {
    const input = document.getElementById("exp-point");
    const value = input.value.trim();

    if (!value) return;

    expPoints.push(value);

    const item = document.createElement("div");
    item.className = "tag-item";

    item.innerHTML = `
        <span>${value}</span>
        <button type="button" onclick="removeExperiencePoint(this, '${value}')">✕</button>
    `;

    document.getElementById("experiencePointList").appendChild(item);

    input.value = "";
}

// ================= REMOVE EXPERIENCE POINT =================
function removeExperiencePoint(button, value) {
    expPoints = expPoints.filter(point => point !== value);
    button.parentElement.remove();
}

// ================= SAVE EXPERIENCE =================
async function saveExperience() {

    const title = document.getElementById("exp-title").value.trim();
    const year = document.getElementById("exp-year").value.trim();
    const company = document.getElementById("exp-company").value.trim();
    const link = document.getElementById("exp-link").value.trim();
    const description = document.getElementById("exp-description").value.trim();

    if (!title || !year || !company) {
        alert("Please fill required fields!");
        return;
    }

    const key = cleanKey(title);

    // ================= BUILD TECHNOLOGY OBJECT =================
    let expTechObj = {};
    expTechnologies.forEach((t, i) => {
        expTechObj[`expTech${i + 1}`] = t;
    });

    // ================= BUILD EXPERIENCE POINTS OBJECT =================
    let expPointObj = {};
    expPoints.forEach((p, i) => {
        expPointObj[`expPoint${i + 1}`] = p;
    });

    // ================= FIREBASE STRUCTURE =================
    await db.ref(`exp/${key}`).set({
        expTitle: title,
        expYear: year,
        expCompany: company,
        expLink: link,
        expDescription: description,
        expTechnologies: expTechObj,
        expPoints: expPointObj
    });

    alert("✅ EXPERIENCE SAVED SUCCESSFULLY");

    clearExperienceForm();
    loadExperienceTable();
}

// ================= CLEAR EXPERIENCE FORM =================
function clearExperienceForm() {

    document.getElementById("exp-title").value = "";
    document.getElementById("exp-year").value = "";
    document.getElementById("exp-company").value = "";
    document.getElementById("exp-link").value = "";
    document.getElementById("exp-description").value = "";

    expTechnologies = [];
    expPoints = [];

    document.getElementById("technologyList").innerHTML = "";
    document.getElementById("experiencePointList").innerHTML = "";
}

// ================= LOAD EXPERIENCE TABLE =================
async function loadExperienceTable() {

    try {

        const snapshot = await db.ref("exp").once("value");

        const container = document.getElementById("experienceList");

        container.innerHTML = "";

        if (!snapshot.exists()) {
            container.innerHTML = "<p>No experience found.</p>";
            return;
        }

        const data = snapshot.val();

        // ================= CREATE TABLE =================
        const table = document.createElement("table");

        table.innerHTML = `
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Company</th>
                    <th>Year</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");

        Object.keys(data).forEach(key => {

            const exp = data[key];

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${exp.expTitle || ""}</td>
                <td>${exp.expCompany || ""}</td>
                <td>${exp.expYear || ""}</td>
                <td>
                    <button onclick="editExperience('${key}')">
                        <span class="material-icons">edit</span>
                    </button>

                    <button onclick="deleteExperience('${key}')">
                        <span class="material-icons">delete</span>
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });

        container.appendChild(table);

    } catch (err) {
        console.error("Experience load error:", err);
    }
}
function deleteExperience(key) {

    const confirmDelete = confirm("Delete this experience?");

    if (!confirmDelete) return;

    db.ref(`exp/${key}`).remove()
        .then(() => {
            alert("Deleted successfully");
            loadExperienceTable();
        })
        .catch(err => {
            alert(err.message);
        });
}
async function editExperience(key) {

    const snapshot = await db.ref(`exp/${key}`).once("value");
    const data = snapshot.val();

    if (!data) {
        alert("Experience not found");
        return;
    }

    // fill form
    document.getElementById("exp-title").value = data.expTitle || "";
    document.getElementById("exp-year").value = data.expYear || "";
    document.getElementById("exp-company").value = data.expCompany || "";
    document.getElementById("exp-link").value = data.expLink || "";
    document.getElementById("exp-description").value = data.expDescription || "";

    // reset arrays
    expTechnologies = [];
    expPoints = [];

    document.getElementById("technologyList").innerHTML = "";
    document.getElementById("experiencePointList").innerHTML = "";

    // reload technologies
    if (data.expTechnologies) {
        Object.values(data.expTechnologies).forEach(t => {
            expTechnologies.push(t);

            const div = document.createElement("div");
            div.className = "tag-item";
            div.innerHTML = `
                <span>${t}</span>
                <button onclick="removeTech(this, '${t}')">✕</button>
            `;
            document.getElementById("technologyList").appendChild(div);
        });
    }

    // reload points
    if (data.expPoints) {
        Object.values(data.expPoints).forEach(p => {
            expPoints.push(p);

            const div = document.createElement("div");
            div.className = "tag-item";
            div.innerHTML = `
                <span>${p}</span>
                <button onclick="removeExperiencePoint(this, '${p}')">✕</button>
            `;
            document.getElementById("experiencePointList").appendChild(div);
        });
    }

    window.editExpKey = key;

    alert("Now update and click SAVE again");
}

// ================= CLOUDINARY VIDEO FIX =================
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

// ================= OPEN MODAL =================
function openPreviewModal(url) {

    if (!url) {
        alert("No file found!");
        return;
    }

    const modal = document.getElementById("previewModal");
    const viewer = document.getElementById("modalViewer");
    const downloadBtn = document.getElementById("modalDownloadBtn");

    viewer.innerHTML = "";
    downloadBtn.href = url;

    const type = detectFileType(url);

    // ================= IMAGE =================
    if (type === "image") {

        viewer.innerHTML = `
            <img src="${url}"
                 style="width:100%;height:100%;object-fit:contain;" />
        `;
    }

    // ================= VIDEO =================
    else if (type === "video") {

        const fixedUrl = fixCloudinaryVideo(url);

        viewer.innerHTML = `
            <div class="media-video-wrapper">
                <video controls autoplay playsinline style="width:100%;height:100%;">
                    <source src="${fixedUrl}" type="video/mp4">
                </video>
            </div>
        `;
    }

    // ================= PDF (Google Drive) =================
    else if (type === "pdf") {

        const fileId = url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1];

        if (fileId) {

            viewer.innerHTML = `
                <iframe
                    src="https://drive.google.com/file/d/${fileId}/preview"
                    style="width:100%;height:100%;border:none;">
                </iframe>
            `;
        } else {

            viewer.innerHTML = `
                <p style="color:white;text-align:center;">
                    Cannot preview this file
                </p>
            `;
        }
    }

    modal.style.display = "flex";
}

// ================= CLOSE MODAL =================
function closePreviewModal() {
    document.getElementById("previewModal").style.display = "none";
    document.getElementById("modalViewer").innerHTML = "";
}

// ================= TYPE DETECTOR =================
function detectFileType(url) {

    if (!url) return "unknown";

    // IMAGE
    if (
        url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) ||
        url.includes("/image/")
    ) {
        return "image";
    }

    // VIDEO
    if (
        url.match(/\.(mp4|webm|ogg)(\?|$)/i) ||
        url.includes("/video/")
    ) {
        return "video";
    }

    // DEFAULT → PDF (Google Drive)
    return "pdf";
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("closeModalBtn")
        .addEventListener("click", closePreviewModal);
});