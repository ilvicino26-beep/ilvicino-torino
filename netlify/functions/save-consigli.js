const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
    try {
        // Controllo metodo HTTP
        if (event.httpMethod !== "POST") {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: "Metodo non consentito" })
            };
        }

        // Controllo body valido
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Body mancante" })
            };
        }

        const body = JSON.parse(event.body);

        if (!body.file || !body.content) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Parametri non validi" })
            };
        }

        // Percorso del file da salvare
        const filePath = path.join(
            __dirname,
            "../../content/consigli",
            body.file
        );

        // Controllo che il file esista
        if (!fs.existsSync(filePath)) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "File non trovato" })
            };
        }

        // Scrive il contenuto aggiornato
        fs.writeFileSync(filePath, body.content, "utf8");

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "File salvato correttamente" })
        };

    } catch (error) {
        console.error("Errore save-consigli:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Errore nel salvare il file" })
        };
    }
};
