const https = require('https');

const SUPABASE_URL = 'https://vvtympzatclvjaqucebr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dHltcHphdGNsdmphcXVjZWJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ1MjU3NiwiZXhwIjoyMDg2MDI4NTc2fQ.YkZLMPoF56tW9rTTygrd2Hx4-WKANXsHl_pe0ZIzeAg';

async function supabaseGet(endpoint) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${SUPABASE_URL}/rest/v1/${endpoint}`);
        
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch {
                        resolve(data);
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });
        
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    console.log('\n=== VERIFICAÇÃO DOS DADOS NO SUPABASE ===\n');
    
    try {
        // Veículos
        const veiculos = await supabaseGet('frota_veiculos?select=placa,modelo');
        console.log(`VEÍCULOS (${veiculos.length}):`);
        veiculos.forEach(v => console.log(`  - ${v.placa}: ${v.modelo}`));
        
        // Manutenções
        const manutencoes = await supabaseGet('frota_manutencoes?select=placa,data,valor&order=data.desc&limit=5');
        console.log(`\nMANUTENÇÕES (últimas 5 de ${manutencoes.length} carregadas):`);
        manutencoes.forEach(m => console.log(`  - ${m.placa} | ${m.data} | R$ ${m.valor}`));
        
        // Contagens
        const countV = await supabaseGet('frota_veiculos?select=id');
        const countM = await supabaseGet('frota_manutencoes?select=id');
        const countS = await supabaseGet('frota_seguros?select=id');
        const countSin = await supabaseGet('frota_sinistros?select=id');
        const countA = await supabaseGet('frota_abastecimentos?select=id');
        
        console.log('\nRESUMO:');
        console.log(`  Veículos: ${countV.length}`);
        console.log(`  Manutenções: ${countM.length}`);
        console.log(`  Seguros: ${countS.length}`);
        console.log(`  Sinistros: ${countSin.length}`);
        console.log(`  Abastecimentos: ${countA.length}`);
        
    } catch (error) {
        console.error('Erro:', error.message);
    }
}

main();
