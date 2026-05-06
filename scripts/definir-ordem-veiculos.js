// Script para definir ordem inicial dos veículos
const SUPABASE_URL = 'https://vvtympzatclvjaqucebr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dHltcHphdGNsdmphcXVjZWJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ1MjU3NiwiZXhwIjoyMDg2MDI4NTc2fQ.YkZLMPoF56tW9rTTygrd2Hx4-WKANXsHl_pe0ZIzeAg';

const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

// Ordem conforme imagem do usuário
const ordemVeiculos = [
    { placa: 'IDZ9109', ordem: 1 },  // L-1113
    { placa: 'ITM7D77', ordem: 2 },  // Uno
    { placa: 'ITU7602', ordem: 3 },  // Uno
    { placa: 'IUW6I28', ordem: 4 },  // Strada
    { placa: 'IZH8C59', ordem: 5 },  // Ford
    { placa: 'JAP5A22', ordem: 6 },  // VW/Nova
    { placa: 'JAU8E28', ordem: 7 },  // Jeep/
    { placa: 'JDK3I54', ordem: 8 },  // RAM
];

async function definirOrdem() {
    console.log('=== Definindo Ordem dos Veículos ===\n');
    
    for (const item of ordemVeiculos) {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/frota_veiculos?placa=eq.${item.placa}`,
                {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({ ordem: item.ordem })
                }
            );

            if (response.ok) {
                console.log(`✓ ${item.placa} -> Ordem ${item.ordem}`);
            } else {
                const error = await response.json();
                console.log(`✗ ${item.placa}: ${error.message || 'Erro desconhecido'}`);
            }
        } catch (error) {
            console.log(`✗ ${item.placa}: ${error.message}`);
        }
    }

    console.log('\n=== Concluído ===');
}

definirOrdem();
