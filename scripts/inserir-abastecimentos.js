// Script para inserir abastecimentos do PDF
const SUPABASE_URL = 'https://vvtympzatclvjaqucebr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dHltcHphdGNsdmphcXVjZWJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ1MjU3NiwiZXhwIjoyMDg2MDI4NTc2fQ.YkZLMPoF56tW9rTTygrd2Hx4-WKANXsHl_pe0ZIzeAg';

const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

// Dados extraídos do PDF (apenas combustíveis)
const abastecimentos = [
    { data: '2026-04-24', placa: 'ITU7602', litros: 38.58, valor_total: 258.88 },
    { data: '2026-04-14', placa: 'ITM7D77', litros: 49.74, valor_total: 346.19 },
    { data: '2026-04-07', placa: 'ITM7D77', litros: 13.78, valor_total: 95.87 },
    { data: '2026-03-30', placa: 'JAP5A22', litros: 50.10, valor_total: 331.16 },
    { data: '2026-03-27', placa: 'ITM7D77', litros: 13.22, valor_total: 91.35 },
    { data: '2026-03-25', placa: 'ITM7D77', litros: 27.33, valor_total: 190.23 },
    { data: '2026-03-23', placa: 'JAP5A22', litros: 28.03, valor_total: 174.07 },
    { data: '2026-03-13', placa: 'ITM7D77', litros: 39.09, valor_total: 260.35 },
    { data: '2026-02-27', placa: 'JAP5A22', litros: 50.07, valor_total: 342.98 },
    { data: '2026-02-25', placa: 'ITM7D77', litros: 40.01, valor_total: 278.47 },
    { data: '2026-02-24', placa: 'JAP5A22', litros: 12.07, valor_total: 75.31 },
    { data: '2026-02-12', placa: 'ITM7D77', litros: 35.00, valor_total: 263.90 },
    { data: '2026-02-02', placa: 'ITM7D77', litros: 30.00, valor_total: 226.20 },
    { data: '2026-01-12', placa: 'ITM7D77', litros: 46.53, valor_total: 350.85 },
    { data: '2026-01-08', placa: 'IUW6I28', litros: 33.50, valor_total: 248.23 },
    { data: '2026-01-04', placa: 'ITU7602', litros: 13.86, valor_total: 82.32 },
    { data: '2026-01-04', placa: 'ITU7602', litros: 16.61, valor_total: 111.45 },
    { data: '2026-01-03', placa: 'ITM7D77', litros: 30.00, valor_total: 226.20 },
    { data: '2026-01-03', placa: 'ITM7D77', litros: 5.00, valor_total: 35.55 },
    { data: '2026-01-02', placa: 'IUW6I28', litros: 37.38, valor_total: 276.99 },
    { data: '2026-01-02', placa: 'ITM7D77', litros: 5.01, valor_total: 36.27 }
];

async function inserirAbastecimentos() {
    console.log('=== Inserindo Abastecimentos ===\n');
    
    let sucesso = 0;
    let erro = 0;

    for (const ab of abastecimentos) {
        const valor_unitario = parseFloat((ab.valor_total / ab.litros).toFixed(2));
        
        const dados = {
            placa: ab.placa,
            data: ab.data,
            litros: ab.litros,
            valor_unitario: valor_unitario,
            valor_total: ab.valor_total
        };

        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/frota_abastecimentos`,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(dados)
                }
            );

            if (response.ok) {
                console.log(`✓ ${ab.data} - ${ab.placa} - ${ab.litros}L - R$ ${ab.valor_total}`);
                sucesso++;
            } else {
                const error = await response.json();
                console.log(`✗ ${ab.data} - ${ab.placa}: ${error.message}`);
                erro++;
            }
        } catch (error) {
            console.log(`✗ ${ab.data} - ${ab.placa}: ${error.message}`);
            erro++;
        }
    }

    console.log(`\n=== Resultado ===`);
    console.log(`Sucesso: ${sucesso}`);
    console.log(`Erros: ${erro}`);
    console.log(`Total: ${abastecimentos.length}`);
}

inserirAbastecimentos();
