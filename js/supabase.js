// Configuração do Supabase
// ATENÇÃO: Para produção, use a anon key e configure RLS adequadamente
const SUPABASE_URL = 'https://vvtympzatclvjaqucebr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dHltcHphdGNsdmphcXVjZWJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ1MjU3NiwiZXhwIjoyMDg2MDI4NTc2fQ.YkZLMPoF56tW9rTTygrd2Hx4-WKANXsHl_pe0ZIzeAg';

// Cliente Supabase usando REST API
const SupabaseClient = {
    headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    },

    // Buscar todos os registros de uma tabela
    async getAll(table, orderBy = 'created_at', ascending = false) {
        try {
            const order = ascending ? `${orderBy}.asc` : `${orderBy}.desc`;
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/${table}?order=${order}`,
                { headers: this.headers }
            );
            if (!response.ok) throw new Error(`Erro ao buscar ${table}`);
            return await response.json();
        } catch (error) {
            console.error('Erro getAll:', error);
            throw error;
        }
    },

    // Buscar registros com filtro
    async getByField(table, field, value) {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/${table}?${field}=eq.${encodeURIComponent(value)}`,
                { headers: this.headers }
            );
            if (!response.ok) throw new Error(`Erro ao buscar ${table}`);
            return await response.json();
        } catch (error) {
            console.error('Erro getByField:', error);
            throw error;
        }
    },

    // Buscar um registro por ID
    async getById(table, id) {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`,
                { headers: this.headers }
            );
            if (!response.ok) throw new Error(`Erro ao buscar ${table}`);
            const data = await response.json();
            return data[0] || null;
        } catch (error) {
            console.error('Erro getById:', error);
            throw error;
        }
    },

    // Inserir novo registro
    async insert(table, data) {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/${table}`,
                {
                    method: 'POST',
                    headers: this.headers,
                    body: JSON.stringify(data)
                }
            );
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Erro ao inserir em ${table}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erro insert:', error);
            throw error;
        }
    },

    // Atualizar registro
    async update(table, id, data) {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`,
                {
                    method: 'PATCH',
                    headers: this.headers,
                    body: JSON.stringify(data)
                }
            );
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Erro ao atualizar ${table}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erro update:', error);
            throw error;
        }
    },

    // Deletar registro
    async delete(table, id) {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`,
                {
                    method: 'DELETE',
                    headers: this.headers
                }
            );
            if (!response.ok) throw new Error(`Erro ao deletar de ${table}`);
            return true;
        } catch (error) {
            console.error('Erro delete:', error);
            throw error;
        }
    },

    // Buscar com múltiplos filtros
    async query(table, filters = {}, orderBy = 'created_at', ascending = false) {
        try {
            let queryParams = [];
            for (const [field, value] of Object.entries(filters)) {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.push(`${field}=eq.${encodeURIComponent(value)}`);
                }
            }
            const order = ascending ? `${orderBy}.asc` : `${orderBy}.desc`;
            queryParams.push(`order=${order}`);
            
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/${table}?${queryParams.join('&')}`,
                { headers: this.headers }
            );
            if (!response.ok) throw new Error(`Erro ao buscar ${table}`);
            return await response.json();
        } catch (error) {
            console.error('Erro query:', error);
            throw error;
        }
    }
};

// Funções auxiliares para cada tabela

const VeiculosAPI = {
    async listar() {
        return await SupabaseClient.getAll('frota_veiculos', 'placa', true);
    },
    async buscarPorPlaca(placa) {
        const results = await SupabaseClient.getByField('frota_veiculos', 'placa', placa);
        return results[0] || null;
    },
    async criar(dados) {
        return await SupabaseClient.insert('frota_veiculos', dados);
    },
    async atualizar(id, dados) {
        return await SupabaseClient.update('frota_veiculos', id, dados);
    },
    async deletar(id) {
        return await SupabaseClient.delete('frota_veiculos', id);
    }
};

const SegurosAPI = {
    async listar() {
        return await SupabaseClient.getAll('frota_seguros', 'vencimento', false);
    },
    async buscarPorPlaca(placa) {
        return await SupabaseClient.getByField('frota_seguros', 'placa', placa);
    },
    async criar(dados) {
        return await SupabaseClient.insert('frota_seguros', dados);
    },
    async atualizar(id, dados) {
        return await SupabaseClient.update('frota_seguros', id, dados);
    },
    async deletar(id) {
        return await SupabaseClient.delete('frota_seguros', id);
    }
};

const ManutencoesAPI = {
    async listar() {
        return await SupabaseClient.getAll('frota_manutencoes', 'data', false);
    },
    async buscarPorPlaca(placa) {
        return await SupabaseClient.getByField('frota_manutencoes', 'placa', placa);
    },
    async criar(dados) {
        return await SupabaseClient.insert('frota_manutencoes', dados);
    },
    async atualizar(id, dados) {
        return await SupabaseClient.update('frota_manutencoes', id, dados);
    },
    async deletar(id) {
        return await SupabaseClient.delete('frota_manutencoes', id);
    }
};

const SinistrosAPI = {
    async listar() {
        return await SupabaseClient.getAll('frota_sinistros', 'data', false);
    },
    async buscarPorPlaca(placa) {
        return await SupabaseClient.getByField('frota_sinistros', 'placa', placa);
    },
    async criar(dados) {
        return await SupabaseClient.insert('frota_sinistros', dados);
    },
    async atualizar(id, dados) {
        return await SupabaseClient.update('frota_sinistros', id, dados);
    },
    async deletar(id) {
        return await SupabaseClient.delete('frota_sinistros', id);
    }
};

const AbastecimentosAPI = {
    async listar() {
        return await SupabaseClient.getAll('frota_abastecimentos', 'data', false);
    },
    async buscarPorPlaca(placa) {
        return await SupabaseClient.getByField('frota_abastecimentos', 'placa', placa);
    },
    async criar(dados) {
        return await SupabaseClient.insert('frota_abastecimentos', dados);
    },
    async atualizar(id, dados) {
        return await SupabaseClient.update('frota_abastecimentos', id, dados);
    },
    async deletar(id) {
        return await SupabaseClient.delete('frota_abastecimentos', id);
    }
};

// Funções de utilidade
const Utils = {
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    },

    formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR');
    },

    parseDate(dateStr) {
        if (!dateStr) return null;
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        return dateStr;
    },

    parseCurrency(value) {
        if (typeof value === 'number') return value;
        if (!value || value === '-') return 0;
        let clean = value.toString().replace('R$', '').trim().replaceAll('.', '').replace(',', '.');
        let floatVal = parseFloat(clean);
        return isNaN(floatVal) ? 0 : floatVal;
    },

    normalizePlate(plate) {
        if (!plate) return '';
        return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container') || this.createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'warning',
            info: 'pencil-simple'
        };
        toast.innerHTML = `
            <i class="ph ph-${icons[type] || 'info'}"></i>
            ${message}
        `;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    },

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
};
