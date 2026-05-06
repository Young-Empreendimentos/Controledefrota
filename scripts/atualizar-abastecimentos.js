// Script para atualizar abastecimentos com dados dos novos PDFs
const SUPABASE_URL = 'https://vvtympzatclvjaqucebr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dHltcHphdGNsdmphcXVjZWJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ1MjU3NiwiZXhwIjoyMDg2MDI4NTc2fQ.YkZLMPoF56tW9rTTygrd2Hx4-WKANXsHl_pe0ZIzeAg';

const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

// Dados extraídos de TODOS os PDFs (apenas combustível - gasolina/diesel)
const abastecimentos = [
    // PDF 6 - Mais recentes (2026)
    { data: '2026-05-05', placa: 'JAP5A22', litros: 47.58, valor_total: 289.76 },
    { data: '2026-05-05', placa: 'ITM7D77', litros: 30.03, valor_total: 212.02 },
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
    { data: '2026-01-07', placa: 'JAP5A22', litros: 46.67, valor_total: 320.16 },
    { data: '2026-01-04', placa: 'ITU7602', litros: 13.86, valor_total: 82.32 },
    { data: '2026-01-04', placa: 'ITU7602', litros: 16.61, valor_total: 111.45 },
    { data: '2026-01-03', placa: 'ITM7D77', litros: 30.00, valor_total: 226.20 },
    { data: '2026-01-03', placa: 'ITM7D77', litros: 5.00, valor_total: 35.55 },
    { data: '2026-01-02', placa: 'IUW6I28', litros: 37.38, valor_total: 276.99 },
    { data: '2026-01-02', placa: 'ITM7D77', litros: 5.01, valor_total: 36.27 },
    
    // PDF 4 e 5 - Outubro a Dezembro 2025
    { data: '2025-12-29', placa: 'IUW6I28', litros: 13.85, valor_total: 99.87 },
    { data: '2025-12-29', placa: 'ITU7602', litros: 24.78, valor_total: 161.29 },
    { data: '2025-12-23', placa: 'IUW6I28', litros: 20.99, valor_total: 142.95 },
    { data: '2025-12-22', placa: 'IUW6I28', litros: 17.90, valor_total: 129.06 },
    { data: '2025-12-19', placa: 'IUW6I28', litros: 45.03, valor_total: 306.66 },
    { data: '2025-12-17', placa: 'ITM7D77', litros: 34.87, valor_total: 238.51 },
    { data: '2025-12-15', placa: 'IUW6I28', litros: 11.95, valor_total: 85.33 },
    { data: '2025-12-12', placa: 'IUW6I28', litros: 48.10, valor_total: 327.57 },
    { data: '2025-12-05', placa: 'IUW6I28', litros: 46.27, valor_total: 315.10 },
    { data: '2025-12-01', placa: 'IUW6I28', litros: 22.11, valor_total: 159.41 },
    { data: '2025-12-01', placa: 'JAP5A22', litros: 37.12, valor_total: 226.81 },
    { data: '2025-11-29', placa: 'ITU7602', litros: 14.45, valor_total: 85.83 },
    { data: '2025-11-29', placa: 'ITM7D77', litros: 23.99, valor_total: 164.10 },
    { data: '2025-11-29', placa: 'ITM7D77', litros: 26.21, valor_total: 179.28 },
    { data: '2025-11-28', placa: 'IUW6I28', litros: 50.48, valor_total: 343.77 },
    { data: '2025-11-27', placa: 'JAP5A22', litros: 17.49, valor_total: 107.38 },
    { data: '2025-11-27', placa: 'JAP5A22', litros: 44.06, valor_total: 304.45 },
    { data: '2025-11-27', placa: 'ITU7602', litros: 13.19, valor_total: 78.34 },
    { data: '2025-11-27', placa: 'JAP5A22', litros: 33.05, valor_total: 196.31 },
    { data: '2025-11-27', placa: 'ITU7602', litros: 17.42, valor_total: 113.41 },
    { data: '2025-11-21', placa: 'IUW6I28', litros: 47.96, valor_total: 342.44 },
    { data: '2025-11-17', placa: 'ITU7602', litros: 39.31, valor_total: 255.91 },
    { data: '2025-11-17', placa: 'IUW6I28', litros: 45.13, valor_total: 322.24 },
    { data: '2025-11-11', placa: 'ITM7D77', litros: 51.80, valor_total: 354.31 },
    { data: '2025-11-11', placa: 'IUW6I28', litros: 29.80, valor_total: 212.77 },
    { data: '2025-11-05', placa: 'IUW6I28', litros: 33.83, valor_total: 243.91 },
    { data: '2025-11-04', placa: 'IUW6I28', litros: 6.79, valor_total: 48.99 },
    { data: '2025-11-01', placa: 'ITU7602', litros: 17.65, valor_total: 103.07 },
    { data: '2025-10-31', placa: 'IUW6I28', litros: 48.61, valor_total: 331.04 },
    { data: '2025-10-30', placa: 'IUW6I28', litros: 32.42, valor_total: 233.75 },
    { data: '2025-10-29', placa: 'IUW6I28', litros: 36.49, valor_total: 263.10 },
    { data: '2025-10-29', placa: 'ITU7602', litros: 22.28, valor_total: 130.11 },
    { data: '2025-10-29', placa: 'ITU7602', litros: 17.60, valor_total: 123.73 },
    { data: '2025-10-29', placa: 'ITM7D77', litros: 29.82, valor_total: 194.13 },
    { data: '2025-10-25', placa: 'IUW6I28', litros: 48.64, valor_total: 350.69 },
    { data: '2025-10-24', placa: 'IUW6I28', litros: 11.14, valor_total: 80.33 },
    { data: '2025-10-22', placa: 'ITU7602', litros: 41.29, valor_total: 294.81 },
    { data: '2025-10-20', placa: 'IUW6I28', litros: 35.72, valor_total: 257.55 },
    { data: '2025-10-16', placa: 'IUW6I28', litros: 36.61, valor_total: 263.96 },
    { data: '2025-10-14', placa: 'ITU7602', litros: 39.30, valor_total: 241.30 },
    { data: '2025-10-14', placa: 'ITU7602', litros: 43.03, valor_total: 280.13 },
    { data: '2025-10-13', placa: 'IUW6I28', litros: 44.73, valor_total: 319.38 },
    { data: '2025-10-10', placa: 'IUW6I28', litros: 18.90, valor_total: 138.17 },
    { data: '2025-10-07', placa: 'IUW6I28', litros: 32.71, valor_total: 239.12 },
    { data: '2025-10-03', placa: 'JAP5A22', litros: 25.69, valor_total: 147.46 },
    { data: '2025-10-02', placa: 'JAP5A22', litros: 36.81, valor_total: 226.75 },
    { data: '2025-09-30', placa: 'IUW6I28', litros: 27.04, valor_total: 197.67 },
    { data: '2025-09-29', placa: 'IUW6I28', litros: 21.00, valor_total: 153.51 },
    { data: '2025-09-25', placa: 'IUW6I28', litros: 38.83, valor_total: 264.44 },
    { data: '2025-09-24', placa: 'JAP5A22', litros: 41.69, valor_total: 255.97 },
    { data: '2025-09-22', placa: 'IUW6I28', litros: 26.49, valor_total: 180.40 },
    { data: '2025-09-19', placa: 'IUW6I28', litros: 22.01, valor_total: 149.89 },
    { data: '2025-09-18', placa: 'IUW6I28', litros: 26.81, valor_total: 195.98 },
    { data: '2025-09-17', placa: 'IUW6I28', litros: 46.68, valor_total: 341.23 },
    { data: '2025-09-10', placa: 'IUW6I28', litros: 25.84, valor_total: 188.90 },
    { data: '2025-09-10', placa: 'IUW6I28', litros: 15.36, valor_total: 112.29 },
    { data: '2025-09-05', placa: 'IUW6I28', litros: 30.12, valor_total: 220.17 },
    { data: '2025-09-04', placa: 'IUW6I28', litros: 23.56, valor_total: 172.23 },
    { data: '2025-08-29', placa: 'IUW6I28', litros: 48.58, valor_total: 330.84 },
    { data: '2025-08-26', placa: 'JAP5A22', litros: 37.79, valor_total: 257.36 },
    { data: '2025-08-19', placa: 'IUW6I28', litros: 28.74, valor_total: 195.69 },
    { data: '2025-08-18', placa: 'IUW6I28', litros: 5.01, valor_total: 35.27 },
    { data: '2025-08-15', placa: 'JAP5A22', litros: 33.74, valor_total: 197.04 },
    { data: '2025-08-15', placa: 'JAP5A22', litros: 30.70, valor_total: 215.21 },
    { data: '2025-08-13', placa: 'IUW6I28', litros: 31.11, valor_total: 227.42 },
    { data: '2025-08-13', placa: 'JAP5A22', litros: 48.28, valor_total: 314.30 },
    { data: '2025-08-12', placa: 'JAP5A22', litros: 40.00, valor_total: 245.60 },
    { data: '2025-08-11', placa: 'IUW6I28', litros: 40.02, valor_total: 292.55 },
    { data: '2025-08-07', placa: 'IUW6I28', litros: 35.06, valor_total: 256.28 },
    { data: '2025-08-04', placa: 'IUW6I28', litros: 39.34, valor_total: 287.58 },
    { data: '2025-07-28', placa: 'IUW6I28', litros: 20.05, valor_total: 146.57 },
    { data: '2025-07-23', placa: 'IUW6I28', litros: 5.00, valor_total: 32.55 },
    { data: '2025-07-23', placa: 'IUW6I28', litros: 25.98, valor_total: 176.92 },
    { data: '2025-07-17', placa: 'ITM7D77', litros: 5.00, valor_total: 30.75 },
    { data: '2025-07-08', placa: 'JAP5A22', litros: 48.95, valor_total: 300.55 },
    { data: '2025-07-08', placa: 'IUW6I28', litros: 42.90, valor_total: 313.60 },
    { data: '2025-07-04', placa: 'IUW6I28', litros: 41.97, valor_total: 302.18 },
    { data: '2025-07-01', placa: 'IUW6I28', litros: 53.01, valor_total: 381.67 },
    { data: '2025-06-24', placa: 'IUW6I28', litros: 45.13, valor_total: 324.95 },
    { data: '2025-06-12', placa: 'IUW6I28', litros: 46.00, valor_total: 313.26 },
    { data: '2025-06-07', placa: 'IUW6I28', litros: 41.47, valor_total: 282.41 },
    { data: '2025-06-05', placa: 'JAP5A22', litros: 24.65, valor_total: 164.92 },
    { data: '2025-06-04', placa: 'JAP5A22', litros: 26.59, valor_total: 179.23 },
    { data: '2025-06-02', placa: 'IUW6I28', litros: 39.36, valor_total: 291.66 },
    { data: '2025-06-02', placa: 'JAP5A22', litros: 47.39, valor_total: 351.17 },
    
    // PDF 2 - Janeiro a Maio 2025
    { data: '2025-05-20', placa: 'IUW6I28', litros: 33.07, valor_total: 245.04 },
    { data: '2025-05-15', placa: 'IUW6I28', litros: 21.28, valor_total: 146.83 },
    { data: '2025-05-14', placa: 'IUW6I28', litros: 26.46, valor_total: 196.06 },
    { data: '2025-05-12', placa: 'IUW6I28', litros: 9.09, valor_total: 64.62 },
    { data: '2025-04-30', placa: 'IUW6I28', litros: 23.02, valor_total: 170.58 },
    { data: '2025-04-30', placa: 'IUW6I28', litros: 15.07, valor_total: 103.98 },
    { data: '2025-04-24', placa: 'IUW6I28', litros: 25.54, valor_total: 176.23 },
    { data: '2025-04-22', placa: 'IUW6I28', litros: 23.42, valor_total: 173.55 },
    { data: '2025-04-17', placa: 'IUW6I28', litros: 22.41, valor_total: 154.63 },
    { data: '2025-04-15', placa: 'IUW6I28', litros: 36.18, valor_total: 268.10 },
    { data: '2025-04-05', placa: 'IUW6I28', litros: 37.00, valor_total: 244.20 },
    { data: '2025-04-03', placa: 'IUW6I28', litros: 0.60, valor_total: 4.08 },
    { data: '2025-04-01', placa: 'IUW6I28', litros: 28.67, valor_total: 203.84 },
    { data: '2025-03-27', placa: 'IUW6I28', litros: 35.39, valor_total: 233.58 },
    { data: '2025-03-24', placa: 'IUW6I28', litros: 26.31, valor_total: 187.07 },
    { data: '2025-03-20', placa: 'IUW6I28', litros: 29.76, valor_total: 199.69 },
    { data: '2025-03-18', placa: 'IUW6I28', litros: 24.70, valor_total: 175.61 },
    { data: '2025-03-14', placa: 'IUW6I28', litros: 34.40, valor_total: 230.82 },
    { data: '2025-03-12', placa: 'ITM7D77', litros: 42.52, valor_total: 302.31 },
    { data: '2025-03-04', placa: 'IUW6I28', litros: 48.11, valor_total: 322.82 },
    { data: '2025-03-03', placa: 'ITM7D77', litros: 47.47, valor_total: 337.51 },
    { data: '2025-02-28', placa: 'IWG8E34', litros: 10.23, valor_total: 61.58 },
    { data: '2025-02-28', placa: 'IWG8E34', litros: 22.81, valor_total: 142.33 },
    { data: '2025-02-26', placa: 'ITM7D77', litros: 28.51, valor_total: 202.73 },
    { data: '2025-02-25', placa: 'IUW6I28', litros: 33.85, valor_total: 227.14 },
    { data: '2025-02-20', placa: 'JCS4F56', litros: 37.89, valor_total: 251.58 },
    { data: '2025-02-20', placa: 'JCS4F56', litros: 42.96, valor_total: 283.11 },
    { data: '2025-02-18', placa: 'ITM7D77', litros: 21.10, valor_total: 150.02 },
    { data: '2025-02-14', placa: 'IWG8E34', litros: 38.91, valor_total: 276.66 },
    { data: '2025-02-13', placa: 'ITM7D77', litros: 20.41, valor_total: 136.94 },
    { data: '2025-02-12', placa: 'IUW6I28', litros: 47.39, valor_total: 317.98 },
    { data: '2025-02-09', placa: 'JCS4F56', litros: 39.71, valor_total: 261.70 },
    { data: '2025-02-08', placa: 'ITM7D77', litros: 43.53, valor_total: 309.51 },
    { data: '2025-02-07', placa: 'IWG8E34', litros: 32.20, valor_total: 200.92 },
    { data: '2025-02-06', placa: 'IUW6I28', litros: 49.18, valor_total: 330.00 },
    { data: '2025-02-05', placa: 'JCS4F56', litros: 28.68, valor_total: 209.65 },
    { data: '2025-02-04', placa: 'IWG8E34', litros: 31.81, valor_total: 226.17 },
    { data: '2025-02-03', placa: 'IWG8E34', litros: 10.85, valor_total: 77.14 },
    { data: '2025-02-02', placa: 'ITM7D77', litros: 36.02, valor_total: 261.51 },
    { data: '2025-01-29', placa: 'JCS4F56', litros: 30.94, valor_total: 196.16 },
    { data: '2025-01-29', placa: 'IUW6I28', litros: 22.77, valor_total: 150.06 },
    { data: '2025-01-28', placa: 'IWG8E34', litros: 31.86, valor_total: 222.06 },
    { data: '2025-01-27', placa: 'IUW6I28', litros: 44.05, valor_total: 286.77 },
    { data: '2025-01-22', placa: 'ITM7D77', litros: 45.61, valor_total: 317.90 },
    { data: '2025-01-21', placa: 'IWG8E34', litros: 39.08, valor_total: 272.39 },
    { data: '2025-01-20', placa: 'IUW6I28', litros: 42.84, valor_total: 278.88 },
    { data: '2025-01-19', placa: 'IWG8E34', litros: 12.17, valor_total: 73.50 },
    { data: '2025-01-17', placa: 'IWG8E34', litros: 31.80, valor_total: 188.89 },
    { data: '2025-01-15', placa: 'IUW6I28', litros: 20.00, valor_total: 130.96 },
    { data: '2025-01-15', placa: 'IWG8E34', litros: 13.08, valor_total: 85.15 },
    { data: '2025-01-14', placa: 'IWG8E34', litros: 31.75, valor_total: 223.84 },
    { data: '2025-01-14', placa: 'IUW6I28', litros: 20.27, valor_total: 131.96 },
    { data: '2025-01-11', placa: 'IUW6I28', litros: 39.57, valor_total: 257.61 },
    { data: '2025-01-10', placa: 'ITM7D77', litros: 48.84, valor_total: 340.42 },
    { data: '2025-01-10', placa: 'IWG8E34', litros: 21.05, valor_total: 146.73 },
    { data: '2025-01-06', placa: 'IWG8E34', litros: 38.96, valor_total: 266.49 },
    { data: '2025-01-06', placa: 'IUW6I28', litros: 22.00, valor_total: 143.22 },
    { data: '2025-01-03', placa: 'ITM7D77', litros: 33.49, valor_total: 235.77 },
    { data: '2025-01-03', placa: 'IUW6I28', litros: 22.52, valor_total: 146.63 },
    
    // PDF 1 - Dezembro 2024
    { data: '2024-12-27', placa: 'IWG8E34', litros: 38.68, valor_total: 262.63 }
];

async function atualizarAbastecimentos() {
    console.log('=== Atualizando Abastecimentos ===\n');
    
    // 1. Deletar todos os abastecimentos existentes
    console.log('Deletando abastecimentos antigos...');
    try {
        const deleteRes = await fetch(
            `${SUPABASE_URL}/rest/v1/frota_abastecimentos?id=neq.00000000-0000-0000-0000-000000000000`,
            {
                method: 'DELETE',
                headers
            }
        );
        if (deleteRes.ok) {
            console.log('✓ Abastecimentos antigos deletados\n');
        }
    } catch (error) {
        console.log('Erro ao deletar:', error.message);
    }

    // 2. Inserir novos abastecimentos
    console.log('Inserindo novos abastecimentos...\n');
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

atualizarAbastecimentos();
