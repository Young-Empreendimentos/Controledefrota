// Script para corrigir as placas nas revisões
const SUPABASE_URL = 'https://vvtympzatclvjaqucebr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dHltcHphdGNsdmphcXVjZWJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ1MjU3NiwiZXhwIjoyMDg2MDI4NTc2fQ.YkZLMPoF56tW9rTTygrd2Hx4-WKANXsHl_pe0ZIzeAg';

const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

// Mapeamento: placa errada -> placa correta
const correcoes = {
    'IUW-5128': 'IUW6I28',  // STRADA
    'ITM-7D77': 'ITM7D77',  // UNO SÃO BORJA
    'ITU-7602': 'ITU7602',  // UNO
    'JAP-5A22': 'JAP5A22'   // SAVEIRO
};

async function corrigirPlacas() {
    console.log('=== Corrigindo placas ===\n');
    
    for (const [placaErrada, placaCorreta] of Object.entries(correcoes)) {
        console.log(`Corrigindo: ${placaErrada} -> ${placaCorreta}`);
        
        // Corrigir em frota_revisoes
        const resRevisoes = await fetch(
            `${SUPABASE_URL}/rest/v1/frota_revisoes?placa=eq.${encodeURIComponent(placaErrada)}`,
            {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ placa: placaCorreta })
            }
        );
        
        if (resRevisoes.ok) {
            const data = await resRevisoes.json();
            console.log(`  ✓ frota_revisoes: ${data.length} registros atualizados`);
        } else {
            console.log(`  ✗ frota_revisoes: erro`);
        }
        
        // Corrigir em frota_veiculos_km
        const resKm = await fetch(
            `${SUPABASE_URL}/rest/v1/frota_veiculos_km?placa=eq.${encodeURIComponent(placaErrada)}`,
            {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ placa: placaCorreta })
            }
        );
        
        if (resKm.ok) {
            const data = await resKm.json();
            console.log(`  ✓ frota_veiculos_km: ${data.length} registros atualizados`);
        } else {
            console.log(`  ✗ frota_veiculos_km: erro`);
        }
    }
    
    console.log('\n=== Correção concluída! ===');
}

corrigirPlacas();
