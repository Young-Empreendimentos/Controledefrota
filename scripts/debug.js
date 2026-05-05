const https = require('https');

const SHEETS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSurhYD5E2awXB7JULubDvz5-OVExEU4PNnRjLd9Frb3jVWItrZjfvAfrY-CO52DXzaP-nFv6FH9jf2/pub?output=csv";

function normalizePlate(plate) {
    if (!plate) return '';
    return plate.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 7);
}

function extractPlateAndModel(text) {
    if (!text) return { placa: '', modelo: '' };
    
    const parts = text.split(/\s*-\s*/);
    let placa = normalizePlate(parts[0] || '');
    let modelo = parts.slice(1).join(' - ').trim();
    
    return { placa, modelo };
}

function fetchURL(url) {
    return new Promise((resolve, reject) => {
        const makeRequest = (requestUrl, redirectCount = 0) => {
            if (redirectCount > 5) {
                reject(new Error('Too many redirects'));
                return;
            }
            
            https.get(requestUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    makeRequest(res.headers.location, redirectCount + 1);
                    return;
                }
                
                if (res.statusCode !== 200) {
                    reject(new Error(`HTTP ${res.statusCode}`));
                    return;
                }
                
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            }).on('error', reject);
        };
        
        makeRequest(url);
    });
}

function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = parseCSVLine(lines[0]);
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === 0) continue;
        
        const row = {};
        headers.forEach((header, idx) => {
            row[header.trim()] = (values[idx] || '').trim();
        });
        
        // Adicionar acesso por índice também
        values.forEach((val, idx) => {
            row[`col${idx}`] = (val || '').trim();
        });
        
        data.push(row);
    }
    return data;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

async function main() {
    console.log('Fetching CSV...');
    const csvText = await fetchURL(SHEETS_URL);
    const data = parseCSV(csvText);
    
    console.log(`Total rows: ${data.length}`);
    
    // Debug first 3 rows
    console.log('\nFirst 3 rows:');
    for (let i = 0; i < 3; i++) {
        const row = data[i];
        console.log(`\nRow ${i}:`);
        console.log(`  row['Placa'] = "${row['Placa']}"`);
        console.log(`  row['col2'] = "${row['col2']}"`);
        
        const placaText = row['Placa'] || row['col2'] || '';
        console.log(`  placaText = "${placaText}"`);
        
        const { placa, modelo } = extractPlateAndModel(placaText);
        console.log(`  extracted: placa="${placa}", modelo="${modelo}"`);
        console.log(`  placa.length = ${placa.length}, valid = ${placa.length >= 5}`);
    }
    
    // Count unique vehicles
    const veiculosUnicos = new Map();
    
    for (const row of data) {
        const placaText = row['Placa'] || row['col2'] || '';
        
        if (!placaText) continue;
        
        const { placa, modelo } = extractPlateAndModel(placaText);
        
        if (placa && placa.length >= 5 && !veiculosUnicos.has(placa)) {
            veiculosUnicos.set(placa, modelo);
        }
    }
    
    console.log(`\nTotal unique vehicles: ${veiculosUnicos.size}`);
    console.log('\nVehicles found:');
    for (const [placa, modelo] of veiculosUnicos) {
        console.log(`  ${placa} - ${modelo}`);
    }
}

main().catch(console.error);
