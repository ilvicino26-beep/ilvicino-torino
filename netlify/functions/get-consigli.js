const fs = require("fs");
const path = require("path");

exports.handler = async () => {
    try {
        // Percorso della cartella "content/consigli"
        const folderPath = path.join(__dirname, "../../content/consigli");

        // Controllo che la cartella esista
        if (!fs.existsSync(folderPath)) {
            console.error("Cartella consigli non trovata:", folderPath);
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Cartella consigli non trovata" })
            };
        }

        // Legge tutti i file nella cartella
        const files = fs.readdirSync(folderPath);

        // Se la cartella è vuota
        if (files.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify([])
            };
        }

        // Legge contenuto di ogni file
        const items = files.map(file => {
            const filePath = path.join(folderPath, file);

            // Controllo che sia un file reale
            if (!fs.lstatSync(filePath).isFile()) return null;

            const content = fs.readFileSync(filePath, "utf8");
            return { file, content };
        }).filter(Boolean);

        return {
            statusCode: 200,
            body: JSON.stringify(items)
        };

    } catch (error) {
        console.error("Errore get-consigli:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Errore nel leggere i consigli" })
        };
    }
};
