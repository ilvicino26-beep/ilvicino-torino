// ===============================
// 🔐 PASSWORD HASH (SHA-256)
// Password reale: "ilvicino2024"
// ===============================
const PASSWORD_HASH = "b8a9f6c6f3f3b8e0d0f4f7b8e2a9c7b4a7d4c6e2f3b8d0f4c6e2a9f7b4c6d2";

// Calcolo SHA-256
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// ===============================
// 🔐 LOGIN
// ===============================
document.getElementById("loginBtn").addEventListener("click", async () => {
    const input = document.getElementById("passwordInput").value;
    const hash = await sha256(input);

    if (hash === PASSWORD_HASH) {
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("loginError").style.display = "none";
    } else {
        document.getElementById("loginError").style.display = "block";
    }
});

// ===============================
// 🌙 TEMA SCURO
// ===============================
document.getElementById("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

// ===============================
// 📁 TRACKER FILE MODIFICATI
// ===============================
let modifiedFiles = {};

// ===============================
// 📌 SIDEBAR + NAVIGAZIONE
// ===============================
document.querySelectorAll(".sidebar li").forEach(item => {
    item.addEventListener("click", () => {

        document.querySelectorAll(".sidebar li").forEach(li => li.classList.remove("active"));
        item.classList.add("active");

        const section = item.getAttribute("data-section");

        if (section === "consigli") {
            loadConsigli();
        } else {
            const view = document.getElementById("view");
            view.innerHTML = `
                <h2>${section}</h2>
                <p>Caricamento contenuti...</p>
            `;
            view.classList.add("fade-in");
            setTimeout(() => view.classList.remove("fade-in"), 400);
        }
    });
});

// ===============================
// 📥 CARICA CONTENUTI CONSIGLI
// ===============================
async function loadConsigli() {
    const view = document.getElementById("view");
    const loader = document.getElementById("loader");

    view.innerHTML = "";
    loader.classList.remove("hidden");

    const res = await fetch("/.netlify/functions/get-consigli");
    const data = await res.json();

    let html = `
        <h2 style="display:flex; justify-content:space-between; align-items:center;">
            Consigli
            <button id="saveAllBtn" class="save-all-btn">💾 Salva tutto</button>
        </h2>
    `;

    data.forEach(item => {
        html += `
            <div class="card" id="card-${item.file}">
                <h3>
                    ${item.file}
                    <span id="mod-${item.file}" class="modified-indicator" style="display:none;">● Modificato</span>
                </h3>

                <textarea id="text-${item.file}">${item.content}</textarea>

                <button onclick="saveConsiglio('${item.file}')">Salva</button>
            </div>
        `;
    });

    loader.classList.add("hidden");
    view.innerHTML = html;

    document.getElementById("saveAllBtn").addEventListener("click", saveAll);

    data.forEach(item => {
        const textarea = document.getElementById(`text-${item.file}`);
        const indicator = document.getElementById(`mod-${item.file}`);

        textarea.addEventListener("input", () => {
            indicator.style.display = "inline";
            modifiedFiles[item.file] = true;
        });
    });

    view.classList.add("fade-in");
    setTimeout(() => view.classList.remove("fade-in"), 400);
}

// ===============================
// 💾 SALVA SINGOLO FILE
// ===============================
async function saveConsiglio(file) {
    const button = event.target;
    const content = document.getElementById(`text-${file}`).value;

    button.classList.add("btn-loading");
    const oldText = button.textContent;
    button.textContent = "Salvataggio...";
    button.disabled = true;

    const res = await fetch("/.netlify/functions/save-consigli", {
        method: "POST",
        body: JSON.stringify({ file, content })
    });

    const result = await res.json();
    showToast(result.message);

    document.getElementById(`mod-${file}`).style.display = "none";
    modifiedFiles[file] = false;

    const card = document.getElementById(`card-${file}`);
    card.classList.add("flash-save");
    setTimeout(() => card.classList.remove("flash-save"), 500);

    button.classList.remove("btn-loading");
    button.classList.add("btn-saved");
    button.textContent = "Salvato ✓";

    setTimeout(() => {
        button.classList.remove("btn-saved");
        button.textContent = oldText;
        button.disabled = false;
    }, 1000);
}

// ===============================
// 💾 SALVA TUTTI I FILE
// ===============================
async function saveAll() {
    const button = document.getElementById("saveAllBtn");

    const filesToSave = Object.keys(modifiedFiles).filter(f => modifiedFiles[f]);

    if (filesToSave.length === 0) {
        showToast("Nessuna modifica da salvare");
        return;
    }

    if (filesToSave.length > 5) {
        const conferma = confirm(
            `Hai ${filesToSave.length} file modificati.\nVuoi davvero salvarli tutti?`
        );

        if (!conferma) {
            showToast("Salvataggio annullato");
            return;
        }
    }

    button.classList.add("btn-loading");
    const oldText = button.textContent;
    button.textContent = "Salvataggio...";

    for (const file of filesToSave) {
        await saveConsiglio(file);
    }

    button.classList.remove("btn-loading");
    button.textContent = oldText;

    showToast("Tutti i file salvati");
}

// ===============================
// 🔔 TOAST
// ===============================
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// ===============================
// 🔄 AUTOSAVE OGNI 10 SECONDI
// ===============================
setInterval(() => {
    for (const file in modifiedFiles) {
        if (modifiedFiles[file]) {
            saveConsiglio(file);
        }
    }
}, 10000);
