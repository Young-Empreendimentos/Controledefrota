// Dashboard - Controle de Frota
// Busca dados do Supabase e Google Sheets

// Links do Google Sheets para dados de formulário (somente leitura)
const GOOGLE_SHEETS_LINKS = {
    registrosUso: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSurhYD5E2awXB7JULubDvz5-OVExEU4PNnRjLd9Frb3jVWItrZjfvAfrY-CO52DXzaP-nFv6FH9jf2/pub?gid=0&single=true&output=csv"
};

// Estado global
let globalData = {
    veiculos: [],
    seguros: [],
    manutencoes: [],
    sinistros: [],
    abastecimentos: [],
    registrosUso: []
};

let selectedPlate = null;
let charts = { history: null, dist: null };

// Inicialização
async function initDashboard() {
    try {
        updateLoadingText('Carregando dados do Supabase...');
        
        // Carregar dados do Supabase em paralelo
        const [veiculos, seguros, manutencoes, sinistros, abastecimentos] = await Promise.all([
            VeiculosAPI.listar(),
            SegurosAPI.listar(),
            ManutencoesAPI.listar(),
            SinistrosAPI.listar(),
            AbastecimentosAPI.listar()
        ]);

        globalData.veiculos = veiculos;
        globalData.seguros = seguros;
        globalData.manutencoes = manutencoes;
        globalData.sinistros = sinistros;
        globalData.abastecimentos = abastecimentos;

        updateLoadingText('Carregando registros de uso...');
        
        // Carregar dados do Google Sheets (registros de uso)
        try {
            const registrosUso = await fetchGoogleSheets(GOOGLE_SHEETS_LINKS.registrosUso);
            globalData.registrosUso = registrosUso;
        } catch (e) {
            console.warn('Não foi possível carregar registros de uso do Google Sheets:', e);
        }

        // Renderizar sidebar
        renderSidebar();

        // Esconder loader
        document.getElementById('loader').style.display = 'none';
        document.getElementById('mainContainer').style.opacity = '1';

        // Selecionar primeiro veículo
        if (globalData.veiculos.length > 0) {
            selectVehicle(globalData.veiculos[0].placa);
        } else {
            document.getElementById('vehicleList').innerHTML = `
                <div style="text-align: center; color: var(--text-muted); padding: 20px;">
                    <i class="ph ph-car" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>Nenhum veículo cadastrado</p>
                    <a href="formularios.html" class="btn btn-primary btn-sm" style="margin-top: 10px;">
                        <i class="ph ph-plus"></i> Cadastrar Veículo
                    </a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Erro ao inicializar dashboard:', error);
        document.getElementById('loadingText').innerHTML = `
            <span style="color: var(--danger);">Erro ao carregar dados</span>
            <br><small>${error.message}</small>
        `;
    }
}

function updateLoadingText(text) {
    const el = document.getElementById('loadingText');
    if (el) el.textContent = text;
}

// Buscar dados do Google Sheets
async function fetchGoogleSheets(url) {
    const response = await fetch(url);
    const text = await response.text();
    return Papa.parse(text, { header: true, skipEmptyLines: true }).data;
}

// Renderizar Sidebar
function renderSidebar() {
    const container = document.getElementById('vehicleList');
    container.innerHTML = '';

    globalData.veiculos.forEach(veiculo => {
        const div = document.createElement('div');
        div.className = 'vehicle-btn';
        div.onclick = () => selectVehicle(veiculo.placa);
        div.id = `btn-${Utils.normalizePlate(veiculo.placa)}`;
        
        const modelShort = veiculo.modelo ? veiculo.modelo.split(' ')[0] : 'N/A';
        
        div.innerHTML = `
            <div style="display:flex; flex-direction:column;">
                <span style="font-weight:700; color:var(--text-main);">${veiculo.placa}</span>
                <span style="font-size:0.75rem;">${modelShort}</span>
            </div>
            <i class="ph ph-caret-right"></i>
        `;
        container.appendChild(div);
    });
}

// Selecionar veículo
function selectVehicle(placa) {
    selectedPlate = placa;
    const normalizedPlate = Utils.normalizePlate(placa);

    // Atualizar botões
    document.querySelectorAll('.vehicle-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`btn-${normalizedPlate}`);
    if (btn) btn.classList.add('active');

    // Buscar dados do veículo
    const veiculo = globalData.veiculos.find(v => Utils.normalizePlate(v.placa) === normalizedPlate);
    if (!veiculo) return;

    // Atualizar header
    document.getElementById('displayPlate').textContent = veiculo.placa;
    document.getElementById('displayModel').textContent = veiculo.modelo || 'Modelo não informado';
    document.getElementById('displayRenavam').textContent = `REN: ${veiculo.renavam || '---'}`;
    document.getElementById('displayYear').textContent = `Ano: ${veiculo.ano_modelo || '---'}`;
    document.getElementById('displayOwner').textContent = `Prop: ${veiculo.proprietario || '---'}`;

    // Buscar seguro
    const seguro = globalData.seguros.find(s => Utils.normalizePlate(s.placa) === normalizedPlate);
    document.getElementById('displayInsurer').textContent = seguro ? `Seg: ${seguro.seguradora}` : 'Sem Seguro';

    // Filtrar dados por placa
    const manutencoes = globalData.manutencoes.filter(m => Utils.normalizePlate(m.placa) === normalizedPlate);
    const sinistros = globalData.sinistros.filter(s => Utils.normalizePlate(s.placa) === normalizedPlate);
    const abastecimentos = globalData.abastecimentos.filter(a => Utils.normalizePlate(a.placa) === normalizedPlate);

    // Filtrar abastecimentos do ano atual
    const currentYear = new Date().getFullYear();
    const abastecimentosAno = abastecimentos.filter(a => {
        const date = new Date(a.data);
        return date.getFullYear() === currentYear;
    });

    // Calcular totais
    const totalMaint = manutencoes.reduce((sum, m) => sum + (parseFloat(m.valor) || 0), 0);
    const totalClaims = sinistros.reduce((sum, s) => sum + (parseFloat(s.valor) || 0), 0);
    const totalFuel = abastecimentosAno.reduce((sum, a) => sum + (parseFloat(a.valor_total) || 0), 0);
    const totalLiters = abastecimentosAno.reduce((sum, a) => sum + (parseFloat(a.litros) || 0), 0);
    const fixedCosts = (parseFloat(veiculo.ipva) || 0) + (seguro ? parseFloat(seguro.valor_seguro) || 0 : 0);
    const totalCost = totalFuel + totalMaint + totalClaims + fixedCosts;

    // Atualizar KPIs
    document.getElementById('kpiTotal').textContent = Utils.formatCurrency(totalCost);
    document.getElementById('kpiFuel').textContent = Utils.formatCurrency(totalFuel);
    document.getElementById('kpiLiters').textContent = `${totalLiters.toFixed(1).replace('.', ',')} L (${currentYear})`;
    document.getElementById('kpiMaint').textContent = Utils.formatCurrency(totalMaint);
    document.getElementById('kpiClaims').textContent = Utils.formatCurrency(totalClaims);
    document.getElementById('kpiFixed').textContent = Utils.formatCurrency(fixedCosts);

    // Atualizar dados cadastrais
    document.getElementById('infoPlate').textContent = veiculo.placa;
    document.getElementById('infoModelFull').textContent = veiculo.modelo || '-';
    document.getElementById('infoYearFull').textContent = veiculo.ano_modelo || '-';
    document.getElementById('infoRenavam').textContent = veiculo.renavam || '-';
    document.getElementById('infoIPVA').textContent = Utils.formatCurrency(veiculo.ipva);
    document.getElementById('infoDPVAT').textContent = Utils.formatCurrency(veiculo.dpvat);
    document.getElementById('infoOwnerFull').textContent = veiculo.proprietario || '-';

    if (seguro) {
        document.getElementById('infoBroker').textContent = seguro.corretora || '-';
        document.getElementById('infoInsurerComp').textContent = seguro.seguradora || '-';
        document.getElementById('infoExpiry').textContent = Utils.formatDate(seguro.vencimento);
        document.getElementById('infoPolicyVal').textContent = Utils.formatCurrency(seguro.valor_seguro);
    } else {
        ['infoBroker', 'infoInsurerComp', 'infoExpiry', 'infoPolicyVal'].forEach(id => {
            document.getElementById(id).textContent = '-';
        });
    }

    // Atualizar tabelas
    updateTables(manutencoes, sinistros, abastecimentosAno);
    
    // Atualizar gráficos
    updateCharts(totalFuel, totalMaint, totalClaims, fixedCosts, abastecimentosAno, manutencoes, sinistros);
}

// Atualizar tabelas
function updateTables(manutencoes, sinistros, abastecimentos) {
    // Tabela de manutenções
    const maintBody = document.querySelector('#maintenanceTable tbody');
    maintBody.innerHTML = '';
    
    const sortedMaint = [...manutencoes].sort((a, b) => new Date(b.data) - new Date(a.data));
    sortedMaint.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${Utils.formatDate(item.data)}</td>
            <td>${item.descricao || '-'}</td>
            <td>${item.mecanico || '-'}</td>
            <td>${Utils.formatCurrency(item.valor)}</td>
        `;
        maintBody.appendChild(tr);
    });

    if (sortedMaint.length === 0) {
        maintBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Nenhuma manutenção registrada</td></tr>';
    }

    // Tabela de sinistros
    const claimsBody = document.querySelector('#claimsTable tbody');
    claimsBody.innerHTML = '';
    
    const sortedClaims = [...sinistros].sort((a, b) => new Date(b.data) - new Date(a.data));
    sortedClaims.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${Utils.formatDate(item.data)}</td>
            <td>${item.descricao || '-'}</td>
            <td>${item.bo || '-'}</td>
            <td>${Utils.formatCurrency(item.valor)}</td>
        `;
        claimsBody.appendChild(tr);
    });

    if (sortedClaims.length === 0) {
        claimsBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Nenhum sinistro registrado</td></tr>';
    }

    // Tabela de abastecimentos
    const fuelBody = document.querySelector('#fuelTable tbody');
    fuelBody.innerHTML = '';
    
    const sortedFuel = [...abastecimentos].sort((a, b) => new Date(b.data) - new Date(a.data));
    sortedFuel.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${Utils.formatDate(item.data)}</td>
            <td>${parseFloat(item.litros || 0).toFixed(2).replace('.', ',')} L</td>
            <td>${Utils.formatCurrency(item.valor_unitario)}</td>
            <td>${Utils.formatCurrency(item.valor_total)}</td>
        `;
        fuelBody.appendChild(tr);
    });

    if (sortedFuel.length === 0) {
        fuelBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Nenhum abastecimento registrado</td></tr>';
    }
}

// Atualizar gráficos
function updateCharts(fuel, maint, claims, fixed, abastecimentos, manutencoes, sinistros) {
    const currentYear = new Date().getFullYear();

    // Gráfico de distribuição
    if (charts.dist) charts.dist.destroy();
    const ctxDist = document.getElementById('distChart').getContext('2d');
    charts.dist = new Chart(ctxDist, {
        type: 'doughnut',
        data: {
            labels: ['Combustível', 'Manutenção', 'Sinistros', 'Fixos'],
            datasets: [{
                data: [fuel, maint, claims, fixed],
                backgroundColor: ['#F59E0B', '#EF4444', '#8B5CF6', '#10B981'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    bottom: 10
                }
            },
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 12,
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });

    // Gráfico de histórico mensal
    const timeline = {};
    
    const addToTimeline = (dateStr, val) => {
        const date = new Date(dateStr);
        if (date.getFullYear() !== currentYear) return;
        const key = `${currentYear}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        if (!timeline[key]) timeline[key] = 0;
        timeline[key] += parseFloat(val) || 0;
    };

    abastecimentos.forEach(a => addToTimeline(a.data, a.valor_total));
    manutencoes.forEach(m => {
        const date = new Date(m.data);
        if (date.getFullYear() === currentYear) {
            addToTimeline(m.data, m.valor);
        }
    });
    sinistros.forEach(s => {
        const date = new Date(s.data);
        if (date.getFullYear() === currentYear) {
            addToTimeline(s.data, s.valor);
        }
    });

    const sortedKeys = Object.keys(timeline).sort();
    const timelineData = sortedKeys.map(k => timeline[k]);
    const timelineLabels = sortedKeys.map(k => {
        const m = k.split('-')[1];
        return `${m}/${currentYear}`;
    });

    if (charts.history) charts.history.destroy();
    const ctxHist = document.getElementById('historyChart').getContext('2d');
    charts.history = new Chart(ctxHist, {
        type: 'bar',
        data: {
            labels: timelineLabels,
            datasets: [{
                label: `Custos Mensais ${currentYear} (R$)`,
                data: timelineData,
                backgroundColor: '#4F46E5',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 10
                }
            },
            plugins: {
                legend: {
                    labels: {
                        boxWidth: 12,
                        padding: 10,
                        font: {
                            size: 11
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                x: { 
                    grid: { display: false },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// Trocar aba
function switchTab(tabName) {
    ['maintenance', 'claims', 'fuel', 'info'].forEach(t => {
        document.getElementById(`tab-${t}`).classList.add('hidden');
    });
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

    document.getElementById(`tab-${tabName}`).classList.remove('hidden');

    const tabs = document.querySelectorAll('.tab');
    const tabIndex = { maintenance: 0, claims: 1, fuel: 2, info: 3 };
    if (tabs[tabIndex[tabName]]) {
        tabs[tabIndex[tabName]].classList.add('active');
    }
}

// Iniciar ao carregar a página
document.addEventListener('DOMContentLoaded', initDashboard);
