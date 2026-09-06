// --- MODUL PENGAMBILAN & PENGIRIMAN DATA ---
function parseCSV(text) {
    let lines = text.split("\n");
    let result = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        let currentLine = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        result.push(currentLine.map(val => val.replace(/^"|"$/g, '').trim()));
    }
    return result;
}

async function ambilDataKas() {
    try {
        let res = await fetch(CONFIG.csvKasUrl);
        let text = await res.text();
        return parseCSV(text);
    } catch (err) {
        console.error("Gagal memuat kas", err);
        return [];
    }
}

async function ambilDataPengurus() {
    try {
        let res = await fetch(CONFIG.csvPengurusUrl);
        let text = await res.text();
        return parseCSV(text);
    } catch (err) {
        console.error("Gagal memuat pengurus", err);
        return [];
    }
}

async function simpanDataKasApi(newData) {
    let res = await fetch(CONFIG.sheetDbApiUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: newData })
    });
    return await res.json();
}
