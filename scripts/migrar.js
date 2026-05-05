const https = require('https');
const http = require('http');

// Configuração Supabase
const SUPABASE_URL = 'https://vvtympzatclvjaqucebr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dHltcHphdGNsdmphcXVjZWJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ1MjU3NiwiZXhwIjoyMDg2MDI4NTc2fQ.YkZLMPoF56tW9rTTygrd2Hx4-WKANXsHl_pe0ZIzeAg';

// Links do Google Sheets
const SHEETS = {
    // URL sem GID para registros de uso (primeira aba / default)
    registrosUso: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSurhYD5E2awXB7JULubDvz5-OVExEU4PNnRjLd9Frb3jVWItrZjfvAfrY-CO52DXzaP-nFv6FH9jf2/pub?output=csv",
    // GID 1342537533 para manutenções
    manutencoes: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSurhYD5E2awXB7JULubDvz5-OVExEU4PNnRjLd9Frb3jVWItrZjfvAfrY-CO52DXzaP-nFv6FH9jf2/pub?gid=1342537533&single=true&output=csv"
};

// Helpers
function log(msg, type = 'info') {
    const colors = { info: '\x1b[36m', success: '\x1b[32m', error: '\x1b[31m', warn: '\x1b[33m' };
    const reset = '\x1b[0m';
    console.log(`${colors[type] || ''}[${new Date().toLocaleTimeString('pt-BR')}] ${msg}${reset}`);
}

function parseCurrency(value) {
    if (typeof value === 'number') return value;
    if (!value || value === '-') return 0;
    let clean = value.toString().replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
    let floatVal = parseFloat(clean);
    return isNaN(floatVal) ? 0 : floatVal;
}

function parseDate(dateStr) {
    if (!dateStr) return null;
    // Formato DD/MM/YYYY ou DD/MM/YYYY HH:MM:SS
    const datePart = dateStr.split(' ')[0];
    const parts = datePart.split('/');
    if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
        return `${year}-${month}-${day}`;
    }
    return dateStr;
}

function normalizePlate(plate) {
    if (!plate) return '';
    return plate.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 7);
}

function extractPlateAndModel(text) {
    if (!text) return { placa: '', modelo: '' };
    
    // Formato: "ITU-7602 - UNO ADESIVADO" 
    // Separar pelo " - " (com espaços) para não quebrar o hífen da placa
    const separatorIndex = text.indexOf(' - ');
    
    let placaPart, modeloPart;
    
    if (separatorIndex > 0) {
        placaPart = text.substring(0, separatorIndex);
        modeloPart = text.substring(separatorIndex + 3).trim();
    } else {
        // Fallback: se não tem " - ", usar o texto inteiro como placa
        placaPart = text;
        modeloPart = '';
    }
    
    const placa = normalizePlate(placaPart);
    
    return { placa, modelo: modeloPart };
}

// Parse CSV simples
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

// Fetch URL com suporte a redirects
function fetchURL(url) {
    return new Promise((resolve, reject) => {
        const makeRequest = (requestUrl, redirectCount = 0) => {
            if (redirectCount > 5) {
                reject(new Error('Too many redirects'));
                return;
            }
            
            const client = requestUrl.startsWith('https') ? https : http;
            
            client.get(requestUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
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

// Supabase API
async function supabaseRequest(endpoint, method, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${SUPABASE_URL}/rest/v1/${endpoint}`);
        
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(data ? JSON.parse(data) : []);
                    } catch {
                        resolve(data);
                    }
                } else {
                    reject(new Error(`Supabase Error ${res.statusCode}: ${data}`));
                }
            });
        });
        
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function getByPlaca(table, placa) {
    try {
        const result = await supabaseRequest(`${table}?placa=eq.${encodeURIComponent(placa)}`, 'GET');
        return result.length > 0 ? result[0] : null;
    } catch {
        return null;
    }
}

async function insert(table, data) {
    return await supabaseRequest(table, 'POST', data);
}

// Migrar Veículos (extraídos dos registros de uso)
async function migrarVeiculos() {
    log('=== Migrando Veículos ===', 'info');
    
    try {
        const csvText = await fetchURL(SHEETS.registrosUso);
        const data = parseCSV(csvText);
        log(`Encontrados ${data.length} registros de uso na planilha`);
        
        // Extrair veículos únicos
        const veiculosUnicos = new Map();
        
        for (const row of data) {
            const placaText = row['Placa'] || row['col2'] || '';
            
            if (!placaText) continue;
            
            const { placa, modelo } = extractPlateAndModel(placaText);
            
            if (placa && placa.length >= 5 && !veiculosUnicos.has(placa)) {
                veiculosUnicos.set(placa, modelo);
            }
        }
        
        log(`Total de ${veiculosUnicos.size} veículos únicos encontrados`);
        
        let imported = 0, skipped = 0, errors = 0;
        
        for (const [placa, modelo] of veiculosUnicos) {
            try {
                const existing = await getByPlaca('frota_veiculos', placa);
                if (!existing) {
                    await insert('frota_veiculos', {
                        placa: placa,
                        modelo: modelo,
                        ano_modelo: '',
                        renavam: '',
                        ipva: 0,
                        dpvat: 0,
                        proprietario: 'Young Empreendimentos'
                    });
                    imported++;
                    log(`  [+] ${placa} - ${modelo}`, 'success');
                } else {
                    skipped++;
                    log(`  [=] ${placa} já existe`, 'info');
                }
            } catch (e) {
                errors++;
                log(`  [X] Erro ${placa}: ${e.message}`, 'error');
            }
        }
        
        log(`Resumo Veículos: ${imported} importados, ${skipped} existentes, ${errors} erros`, 'success');
        return imported;
    } catch (error) {
        log(`Erro ao migrar veículos: ${error.message}`, 'error');
        return 0;
    }
}

// Migrar Manutenções (da aba de manutenções - GID 1342537533)
async function migrarManutencoes() {
    log('=== Migrando Manutenções ===', 'info');
    
    try {
        const csvText = await fetchURL(SHEETS.manutencoes);
        const data = parseCSV(csvText);
        log(`Encontrados ${data.length} registros na planilha`);
        
        // Verificar se já existem manutenções
        const existingCount = await supabaseRequest('frota_manutencoes?select=count', 'GET');
        if (existingCount && existingCount.length > 0 && existingCount[0].count > 0) {
            log(`Já existem ${existingCount[0].count} manutenções no banco. Pulando...`, 'warn');
            return 0;
        }
        
        let imported = 0, errors = 0;
        
        for (const row of data) {
            // Estrutura da planilha (com coluna vazia no início):
            // col0: vazio
            // col1: Data da solicitação
            // col2: Placa
            // col3: Descrição da manutenção
            // col4: Valor
            // col5: Mecânico
            
            const dataCol = row['col1'] || '';
            const placaCol = row['col2'] || '';
            const descCol = row['col3'] || '';
            const valorCol = row['col4'] || '';
            const mecanicoCol = row['col5'] || '';
            
            // Normalizar placa
            const placa = normalizePlate(placaCol);
            
            // Pular linhas de cabeçalho ou sem placa válida
            if (!placa || placa.length < 5) continue;
            if (placaCol.toLowerCase().includes('placa')) continue;
            
            const dataFormatada = parseDate(dataCol);
            const valor = parseCurrency(valorCol);
            
            // Pular linhas sem data e sem valor
            if (!dataFormatada && valor === 0 && !descCol) continue;
            
            try {
                await insert('frota_manutencoes', {
                    placa: placa,
                    data: dataFormatada,
                    descricao: descCol.substring(0, 500),
                    mecanico: mecanicoCol,
                    valor: valor
                });
                imported++;
                log(`  [+] ${placa} | ${dataFormatada || 'N/A'} | R$ ${valor.toFixed(2)}`, 'success');
            } catch (e) {
                errors++;
                if (!e.message.includes('duplicate')) {
                    log(`  [X] Erro: ${e.message.substring(0, 80)}`, 'error');
                }
            }
        }
        
        log(`Resumo Manutenções: ${imported} importados, ${errors} erros`, 'success');
        return imported;
    } catch (error) {
        log(`Erro ao migrar manutenções: ${error.message}`, 'error');
        return 0;
    }
}

// Main
async function main() {
    console.log('\n========================================');
    console.log('  MIGRAÇÃO DE DADOS - CONTROLE DE FROTA');
    console.log('========================================\n');
    
    log('Iniciando migração...', 'info');
    console.log('');
    
    const veiculos = await migrarVeiculos();
    console.log('');
    
    const manutencoes = await migrarManutencoes();
    console.log('');
    
    console.log('========================================');
    log(`MIGRAÇÃO CONCLUÍDA!`, 'success');
    log(`Total: ${veiculos} veículos, ${manutencoes} manutenções`, 'info');
    console.log('========================================\n');
    
    log('Nota: Seguros, Sinistros e Abastecimentos devem ser', 'warn');
    log('adicionados manualmente através do formulário.', 'warn');
}

main().catch(err => {
    log(`Erro fatal: ${err.message}`, 'error');
    process.exit(1);
});
