// Script para inserir dados de revisões dos veículos
// Execute com: node scripts/inserir-revisoes.js

const SUPABASE_URL = 'https://vvtympzatclvjaqucebr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dHltcHphdGNsdmphcXVjZWJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ1MjU3NiwiZXhwIjoyMDg2MDI4NTc2fQ.YkZLMPoF56tW9rTTygrd2Hx4-WKANXsHl_pe0ZIzeAg';

const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

// Dados dos veículos (KM atual e data de atualização)
const veiculosKm = [
    { placa: 'IUW-5128', km_atual: 214000, data_atualizacao: '2026-04-23' },
    { placa: 'ITM-7D77', km_atual: 193626, data_atualizacao: '2026-04-23' },
    { placa: 'JAP-5A22', km_atual: 59373, data_atualizacao: '2026-04-23' },
    { placa: 'ITU-7602', km_atual: 107805, data_atualizacao: '2026-04-23' }
];

// Dados de revisão de cada veículo (baseado nos prints)
const revisoesVeiculos = {
    'IUW-5128': [ // STRADA
        { item_servico: 'Geometria e balanceamento', periodicidade_km: 10000, ultima_manutencao_km: 211182, data_ultima_manutencao: '2025-06-14' },
        { item_servico: 'Correia do alternador', periodicidade_km: 50000, ultima_manutencao_km: 174120, data_ultima_manutencao: '2024-09-09' },
        { item_servico: 'Correia dentada', periodicidade_km: 50000, ultima_manutencao_km: 174120, data_ultima_manutencao: '2024-09-09' },
        { item_servico: 'Correia do compressor do ar-condicionado', periodicidade_km: 50000, ultima_manutencao_km: 174120, data_ultima_manutencao: '2024-09-09' },
        { item_servico: 'Correia poly-v (bomba d\'água)', periodicidade_km: 50000, ultima_manutencao_km: 208463, data_ultima_manutencao: '2026-01-07' },
        { item_servico: 'Filtro de ar motor', periodicidade_km: 10000, ultima_manutencao_km: 189000, data_ultima_manutencao: '2025-06-14' },
        { item_servico: 'Filtro de cabine (antipólen)', periodicidade_km: 30000, ultima_manutencao_km: 184202, data_ultima_manutencao: '2024-09-09' },
        { item_servico: 'Filtro de combustível', periodicidade_km: 20000, ultima_manutencao_km: 184202, data_ultima_manutencao: '2025-06-14' },
        { item_servico: 'Óleo lubrificante', periodicidade_km: 8000, ultima_manutencao_km: 208463, data_ultima_manutencao: '2026-01-07' },
        { item_servico: 'Filtro de óleo*', periodicidade_km: 8000, ultima_manutencao_km: 208463, data_ultima_manutencao: '2026-01-07' },
        { item_servico: 'Fluido das transmissões', periodicidade_km: 70000, ultima_manutencao_km: 174120, data_ultima_manutencao: '2024-09-09' },
        { item_servico: 'Fluido de freio (óleo do freio)', periodicidade_km: 30000, ultima_manutencao_km: 211182, data_ultima_manutencao: '2024-09-09' },
        { item_servico: 'Limpeza do ar condicionado', periodicidade_km: 30000, ultima_manutencao_km: 174120, data_ultima_manutencao: '2025-06-14' },
        { item_servico: 'Limpeza do sistema de arrefecimento', periodicidade_km: 50000, ultima_manutencao_km: 208463, data_ultima_manutencao: '2026-01-07' },
        { item_servico: 'Líquido de arrefecimento', periodicidade_km: 50000, ultima_manutencao_km: 208463, data_ultima_manutencao: '2026-01-07' },
        { item_servico: 'Pneus', periodicidade_km: 50000, ultima_manutencao_km: 208463, data_ultima_manutencao: '2025-07-05' },
        { item_servico: 'Velas', periodicidade_km: 40000, ultima_manutencao_km: 174120, data_ultima_manutencao: '2024-09-09' },
        { item_servico: 'Freios', periodicidade_km: 30000, ultima_manutencao_km: 211182, data_ultima_manutencao: '2025-06-14' },
        { item_servico: 'Sistema de Injeção', periodicidade_km: 30000, ultima_manutencao_km: 174120, data_ultima_manutencao: '2025-06-14' },
        { item_servico: 'Sinalização', periodicidade_km: null, ultima_manutencao_km: 174120, data_ultima_manutencao: '2024-09-09' },
        { item_servico: 'Amortecedor', periodicidade_km: null, ultima_manutencao_km: 174120, data_ultima_manutencao: '2024-09-09' }
    ],
    'ITM-7D77': [ // UNO (SÃO BORJA/RS)
        { item_servico: 'Geometria e balanceamento', periodicidade_km: 10000, ultima_manutencao_km: 170664, data_ultima_manutencao: '2024-08-05' },
        { item_servico: 'Correia dentada', periodicidade_km: 50000, ultima_manutencao_km: 191541, data_ultima_manutencao: '2025-04-04' },
        { item_servico: 'Correia poly-v (bomba d\'água)', periodicidade_km: 50000, ultima_manutencao_km: 185850, data_ultima_manutencao: '2025-08-05' },
        { item_servico: 'Filtro de ar motor', periodicidade_km: 10000, ultima_manutencao_km: 170664, data_ultima_manutencao: '2024-08-02' },
        { item_servico: 'Filtro de cabine (antipólen)', periodicidade_km: 30000, ultima_manutencao_km: 170664, data_ultima_manutencao: '2024-08-02' },
        { item_servico: 'Filtro de combustível', periodicidade_km: 20000, ultima_manutencao_km: 170664, data_ultima_manutencao: '2024-08-02' },
        { item_servico: 'Óleo lubrificante', periodicidade_km: 8000, ultima_manutencao_km: 191541, data_ultima_manutencao: '2026-03-04' },
        { item_servico: 'Filtro de óleo*', periodicidade_km: 8000, ultima_manutencao_km: 191541, data_ultima_manutencao: '2026-03-04' },
        { item_servico: 'Fluido das transmissões', periodicidade_km: 70000, ultima_manutencao_km: 191541, data_ultima_manutencao: '2026-03-04' },
        { item_servico: 'Fluido de freio (óleo do freio)', periodicidade_km: 30000, ultima_manutencao_km: 191541, data_ultima_manutencao: '2026-03-04' },
        { item_servico: 'Limpeza do sistema de arrefecimento', periodicidade_km: 50000, ultima_manutencao_km: 185850, data_ultima_manutencao: '2025-08-05' },
        { item_servico: 'Líquido de arrefecimento', periodicidade_km: 50000, ultima_manutencao_km: 185850, data_ultima_manutencao: '2025-08-05' },
        { item_servico: 'Pneus', periodicidade_km: 50000, ultima_manutencao_km: 192080, data_ultima_manutencao: '2026-03-20' },
        { item_servico: 'Velas', periodicidade_km: 40000, ultima_manutencao_km: 192080, data_ultima_manutencao: '2026-03-20' },
        { item_servico: 'Freios', periodicidade_km: 30000, ultima_manutencao_km: 191541, data_ultima_manutencao: '2026-03-04' },
        { item_servico: 'Sistema de Injeção', periodicidade_km: 30000, ultima_manutencao_km: 170664, data_ultima_manutencao: '2023-01-15' },
        { item_servico: 'Sinalização', periodicidade_km: null, ultima_manutencao_km: 170664, data_ultima_manutencao: '2024-02-05' },
        { item_servico: 'Amortecedor', periodicidade_km: null, ultima_manutencao_km: 191541, data_ultima_manutencao: '2026-03-04' }
    ],
    'JAP-5A22': [ // SAVEIRO
        { item_servico: 'Geometria e balanceamento', periodicidade_km: 10000, ultima_manutencao_km: 59373, data_ultima_manutencao: '2023-10-03' },
        { item_servico: 'Correia do alternador', periodicidade_km: 50000, ultima_manutencao_km: 46701, data_ultima_manutencao: '2025-09-08' },
        { item_servico: 'Correia dentada', periodicidade_km: 50000, ultima_manutencao_km: 46701, data_ultima_manutencao: '2025-09-08' },
        { item_servico: 'Correia do compressor do ar-condicionado', periodicidade_km: 50000, ultima_manutencao_km: 46701, data_ultima_manutencao: '2025-09-08' },
        { item_servico: 'Correia poly-v (bomba d\'água)', periodicidade_km: 50000, ultima_manutencao_km: 40374, data_ultima_manutencao: '2025-02-03' },
        { item_servico: 'Filtro de ar motor', periodicidade_km: 10000, ultima_manutencao_km: 59373, data_ultima_manutencao: '2025-09-08' },
        { item_servico: 'Filtro de cabine (antipólen)', periodicidade_km: 30000, ultima_manutencao_km: 46701, data_ultima_manutencao: '2025-09-08' },
        { item_servico: 'Filtro de combustível', periodicidade_km: 20000, ultima_manutencao_km: 46701, data_ultima_manutencao: '2025-09-08' },
        { item_servico: 'Óleo lubrificante', periodicidade_km: 8000, ultima_manutencao_km: 59373, data_ultima_manutencao: '2025-08-28' },
        { item_servico: 'Filtro de óleo*', periodicidade_km: 8000, ultima_manutencao_km: 59373, data_ultima_manutencao: '2025-08-28' },
        { item_servico: 'Fluido das transmissões', periodicidade_km: 70000, ultima_manutencao_km: 40374, data_ultima_manutencao: '2024-08-16' },
        { item_servico: 'Fluido de freio (óleo do freio)', periodicidade_km: 30000, ultima_manutencao_km: 40374, data_ultima_manutencao: '2024-08-16' },
        { item_servico: 'Limpeza do ar condicionado', periodicidade_km: 30000, ultima_manutencao_km: 40374, data_ultima_manutencao: '2025-02-03' },
        { item_servico: 'Limpeza do sistema de arrefecimento', periodicidade_km: 50000, ultima_manutencao_km: 46701, data_ultima_manutencao: '2025-09-08' },
        { item_servico: 'Líquido de arrefecimento', periodicidade_km: 50000, ultima_manutencao_km: 46701, data_ultima_manutencao: '2025-09-08' },
        { item_servico: 'Pneus', periodicidade_km: 50000, ultima_manutencao_km: 46701, data_ultima_manutencao: '2025-09-08' },
        { item_servico: 'Velas', periodicidade_km: 40000, ultima_manutencao_km: 46701, data_ultima_manutencao: '2025-09-08' },
        { item_servico: 'Freios', periodicidade_km: 30000, ultima_manutencao_km: 46701, data_ultima_manutencao: '2025-09-08' },
        { item_servico: 'Sistema de Injeção', periodicidade_km: 30000, ultima_manutencao_km: 46701, data_ultima_manutencao: '2025-09-08' },
        { item_servico: 'Sinalização', periodicidade_km: null, ultima_manutencao_km: 46701, data_ultima_manutencao: '2025-09-08' },
        { item_servico: 'Amortecedor', periodicidade_km: null, ultima_manutencao_km: 46701, data_ultima_manutencao: '2025-09-08' }
    ],
    'ITU-7602': [ // UNO
        { item_servico: 'Geometria e balanceamento', periodicidade_km: 10000, ultima_manutencao_km: 107805, data_ultima_manutencao: '2026-04-08' },
        { item_servico: 'Correia do alternador', periodicidade_km: 50000, ultima_manutencao_km: 97296, data_ultima_manutencao: '2025-02-03' },
        { item_servico: 'Correia dentada', periodicidade_km: 50000, ultima_manutencao_km: 97296, data_ultima_manutencao: '2025-02-03' },
        { item_servico: 'Correia do compressor do ar-condicionado', periodicidade_km: 50000, ultima_manutencao_km: 92849, data_ultima_manutencao: null },
        { item_servico: 'Correia poly-v (bomba d\'água)', periodicidade_km: 50000, ultima_manutencao_km: 100360, data_ultima_manutencao: '2025-08-22' },
        { item_servico: 'Filtro de ar motor', periodicidade_km: 10000, ultima_manutencao_km: 97296, data_ultima_manutencao: '2025-02-03' },
        { item_servico: 'Filtro de cabine (antipólen)', periodicidade_km: 30000, ultima_manutencao_km: 92849, data_ultima_manutencao: '2024-08-16' },
        { item_servico: 'Filtro de combustível', periodicidade_km: 20000, ultima_manutencao_km: 100360, data_ultima_manutencao: '2025-08-22' },
        { item_servico: 'Óleo lubrificante', periodicidade_km: 8000, ultima_manutencao_km: 106127, data_ultima_manutencao: '2026-04-08' },
        { item_servico: 'Filtro de óleo*', periodicidade_km: 8000, ultima_manutencao_km: 106127, data_ultima_manutencao: '2026-04-08' },
        { item_servico: 'Fluido das transmissões', periodicidade_km: 70000, ultima_manutencao_km: 106127, data_ultima_manutencao: '2026-04-08' },
        { item_servico: 'Fluido de freio (óleo do freio)', periodicidade_km: 30000, ultima_manutencao_km: 102324, data_ultima_manutencao: '2025-10-28' },
        { item_servico: 'Limpeza do ar condicionado', periodicidade_km: 30000, ultima_manutencao_km: 97296, data_ultima_manutencao: '2025-02-03' },
        { item_servico: 'Limpeza do sistema de arrefecimento', periodicidade_km: 50000, ultima_manutencao_km: 100360, data_ultima_manutencao: '2025-08-22' },
        { item_servico: 'Líquido de arrefecimento', periodicidade_km: 50000, ultima_manutencao_km: 100360, data_ultima_manutencao: '2025-08-22' },
        { item_servico: 'Pneus', periodicidade_km: 50000, ultima_manutencao_km: 101010, data_ultima_manutencao: '2025-10-02' },
        { item_servico: 'Velas', periodicidade_km: 40000, ultima_manutencao_km: 100360, data_ultima_manutencao: '2025-08-22' },
        { item_servico: 'Freios', periodicidade_km: 30000, ultima_manutencao_km: 102324, data_ultima_manutencao: '2025-10-28' },
        { item_servico: 'Sistema de Injeção', periodicidade_km: 30000, ultima_manutencao_km: 97296, data_ultima_manutencao: '2025-02-03' },
        { item_servico: 'Sinalização', periodicidade_km: null, ultima_manutencao_km: 100360, data_ultima_manutencao: '2025-08-22' },
        { item_servico: 'Amortecedor', periodicidade_km: null, ultima_manutencao_km: 106127, data_ultima_manutencao: '2026-04-08' }
    ]
};

async function inserirDados() {
    console.log('Iniciando inserção de dados de revisões...\n');

    // 1. Inserir KM dos veículos
    console.log('=== Inserindo KM dos veículos ===');
    for (const veiculo of veiculosKm) {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/frota_veiculos_km`,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(veiculo)
                }
            );
            
            if (response.ok) {
                console.log(`✓ KM inserido: ${veiculo.placa} - ${veiculo.km_atual} km`);
            } else {
                const error = await response.json();
                if (error.code === '23505') {
                    // Já existe, atualizar
                    const updateResponse = await fetch(
                        `${SUPABASE_URL}/rest/v1/frota_veiculos_km?placa=eq.${veiculo.placa}`,
                        {
                            method: 'PATCH',
                            headers,
                            body: JSON.stringify({ km_atual: veiculo.km_atual, data_atualizacao: veiculo.data_atualizacao })
                        }
                    );
                    if (updateResponse.ok) {
                        console.log(`✓ KM atualizado: ${veiculo.placa} - ${veiculo.km_atual} km`);
                    }
                } else {
                    console.log(`✗ Erro ao inserir KM ${veiculo.placa}:`, error.message);
                }
            }
        } catch (error) {
            console.log(`✗ Erro ao inserir KM ${veiculo.placa}:`, error.message);
        }
    }

    // 2. Inserir revisões de cada veículo
    console.log('\n=== Inserindo itens de revisão ===');
    for (const [placa, revisoes] of Object.entries(revisoesVeiculos)) {
        console.log(`\nVeículo: ${placa}`);
        
        for (const revisao of revisoes) {
            try {
                const dados = {
                    placa,
                    item_servico: revisao.item_servico,
                    periodicidade_km: revisao.periodicidade_km,
                    ultima_manutencao_km: revisao.ultima_manutencao_km,
                    data_ultima_manutencao: revisao.data_ultima_manutencao
                };

                const response = await fetch(
                    `${SUPABASE_URL}/rest/v1/frota_revisoes`,
                    {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(dados)
                    }
                );

                if (response.ok) {
                    console.log(`  ✓ ${revisao.item_servico}`);
                } else {
                    const error = await response.json();
                    console.log(`  ✗ ${revisao.item_servico}: ${error.message}`);
                }
            } catch (error) {
                console.log(`  ✗ ${revisao.item_servico}: ${error.message}`);
            }
        }
    }

    console.log('\n=== Inserção concluída! ===');
}

inserirDados();
