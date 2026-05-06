// Formulários - Controle de Frota
// CRUD completo para todas as entidades

let veiculos = [];
let deleteCallback = null;

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await loadVeiculos();
    await loadAllTables();
    
    // Configurar botão cancelar do modal
    const btnCancel = document.getElementById('btnCancelDelete');
    if (btnCancel) {
        btnCancel.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeDeleteModal();
        });
    }
    
    // Fechar modal ao clicar no overlay
    const modalOverlay = document.getElementById('modal-delete');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeDeleteModal();
            }
        });
    }
});

// Carregar lista de veículos para os selects
async function loadVeiculos() {
    try {
        veiculos = await VeiculosAPI.listar();
        updateVeiculoSelects();
    } catch (error) {
        console.error('Erro ao carregar veículos:', error);
        Utils.showToast('Erro ao carregar lista de veículos', 'error');
    }
}

function updateVeiculoSelects() {
    const selects = ['seguroPlaca', 'manutencaoPlaca', 'sinistroPlaca', 'abastecimentoPlaca'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Selecione um veículo</option>';
            veiculos.forEach(v => {
                select.innerHTML += `<option value="${v.placa}">${v.placa} - ${v.modelo || 'N/A'}</option>`;
            });
        }
    });
}

// Carregar todas as tabelas
async function loadAllTables() {
    await Promise.all([
        loadTableVeiculos(),
        loadTableSeguros(),
        loadTableManutencoes(),
        loadTableSinistros(),
        loadTableAbastecimentos()
    ]);
}

// =============================================
// VEÍCULOS
// =============================================

async function loadTableVeiculos() {
    try {
        const data = await VeiculosAPI.listar();
        const tbody = document.querySelector('#tableVeiculos tbody');
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Nenhum veículo cadastrado</td></tr>';
            return;
        }

        data.forEach(item => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${item.placa}</strong></td>
                    <td>${item.modelo || '-'}</td>
                    <td>${item.ano_modelo || '-'}</td>
                    <td>${item.renavam || '-'}</td>
                    <td>${Utils.formatCurrency(item.ipva)}</td>
                    <td class="actions">
                        <button class="btn btn-sm btn-secondary" onclick="editVeiculo('${item.id}')">
                            <i class="ph ph-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="confirmDelete('veiculo', '${item.id}')">
                            <i class="ph ph-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Erro ao carregar veículos:', error);
    }
}

async function saveVeiculo(event) {
    event.preventDefault();
    
    const id = document.getElementById('veiculoId').value;
    const dados = {
        placa: document.getElementById('veiculoPlaca').value.toUpperCase(),
        modelo: document.getElementById('veiculoModelo').value,
        ano_modelo: document.getElementById('veiculoAno').value,
        renavam: document.getElementById('veiculoRenavam').value,
        ipva: parseFloat(document.getElementById('veiculoIPVA').value) || 0,
        dpvat: parseFloat(document.getElementById('veiculoDPVAT').value) || 0,
        proprietario: document.getElementById('veiculoProprietario').value
    };

    try {
        if (id) {
            await VeiculosAPI.atualizar(id, dados);
            Utils.showToast('Veículo atualizado com sucesso!', 'success');
        } else {
            await VeiculosAPI.criar(dados);
            Utils.showToast('Veículo cadastrado com sucesso!', 'success');
        }
        clearFormVeiculo();
        await loadVeiculos();
        await loadTableVeiculos();
    } catch (error) {
        Utils.showToast('Erro ao salvar veículo: ' + error.message, 'error');
    }
}

async function editVeiculo(id) {
    try {
        const item = await SupabaseClient.getById('frota_veiculos', id);
        if (item) {
            document.getElementById('veiculoId').value = item.id;
            document.getElementById('veiculoPlaca').value = item.placa;
            document.getElementById('veiculoModelo').value = item.modelo || '';
            document.getElementById('veiculoAno').value = item.ano_modelo || '';
            document.getElementById('veiculoRenavam').value = item.renavam || '';
            document.getElementById('veiculoIPVA').value = item.ipva || '';
            document.getElementById('veiculoDPVAT').value = item.dpvat || '';
            document.getElementById('veiculoProprietario').value = item.proprietario || '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (error) {
        Utils.showToast('Erro ao carregar veículo', 'error');
    }
}

function clearFormVeiculo() {
    document.getElementById('formVeiculo').reset();
    document.getElementById('veiculoId').value = '';
}

async function deleteVeiculo(id) {
    try {
        await VeiculosAPI.deletar(id);
        Utils.showToast('Veículo excluído com sucesso!', 'success');
        await loadVeiculos();
        await loadTableVeiculos();
    } catch (error) {
        Utils.showToast('Erro ao excluir veículo', 'error');
    }
}

// =============================================
// SEGUROS
// =============================================

async function loadTableSeguros() {
    try {
        const data = await SegurosAPI.listar();
        const tbody = document.querySelector('#tableSeguros tbody');
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Nenhum seguro cadastrado</td></tr>';
            return;
        }

        data.forEach(item => {
            const apoliceLink = item.url_apolice 
                ? `<a href="${item.url_apolice}" target="_blank" class="btn btn-sm btn-primary"><i class="ph ph-file-pdf"></i> Ver</a>` 
                : '-';
            tbody.innerHTML += `
                <tr>
                    <td><strong>${item.placa}</strong></td>
                    <td>${item.corretora || '-'}</td>
                    <td>${item.seguradora || '-'}</td>
                    <td>${Utils.formatDate(item.vencimento)}</td>
                    <td>${Utils.formatCurrency(item.valor_seguro)}</td>
                    <td>${apoliceLink}</td>
                    <td class="actions">
                        <button class="btn btn-sm btn-secondary" onclick="editSeguro('${item.id}')">
                            <i class="ph ph-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="confirmDelete('seguro', '${item.id}')">
                            <i class="ph ph-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Erro ao carregar seguros:', error);
    }
}

async function saveSeguro(event) {
    event.preventDefault();
    
    const id = document.getElementById('seguroId').value;
    const dados = {
        placa: document.getElementById('seguroPlaca').value,
        corretora: document.getElementById('seguroCorretora').value,
        seguradora: document.getElementById('seguroSeguradora').value,
        vencimento: document.getElementById('seguroVencimento').value || null,
        valor_seguro: parseFloat(document.getElementById('seguroValor').value) || 0,
        url_apolice: document.getElementById('seguroUrlApolice').value || null
    };

    try {
        if (id) {
            await SegurosAPI.atualizar(id, dados);
            Utils.showToast('Seguro atualizado com sucesso!', 'success');
        } else {
            await SegurosAPI.criar(dados);
            Utils.showToast('Seguro cadastrado com sucesso!', 'success');
        }
        clearFormSeguro();
        await loadTableSeguros();
    } catch (error) {
        Utils.showToast('Erro ao salvar seguro: ' + error.message, 'error');
    }
}

async function editSeguro(id) {
    try {
        const item = await SupabaseClient.getById('frota_seguros', id);
        if (item) {
            document.getElementById('seguroId').value = item.id;
            document.getElementById('seguroPlaca').value = item.placa;
            document.getElementById('seguroCorretora').value = item.corretora || '';
            document.getElementById('seguroSeguradora').value = item.seguradora || '';
            document.getElementById('seguroVencimento').value = item.vencimento || '';
            document.getElementById('seguroValor').value = item.valor_seguro || '';
            document.getElementById('seguroUrlApolice').value = item.url_apolice || '';
            showForm('seguros');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (error) {
        Utils.showToast('Erro ao carregar seguro', 'error');
    }
}

function clearFormSeguro() {
    document.getElementById('formSeguro').reset();
    document.getElementById('seguroId').value = '';
    document.getElementById('seguroUrlApolice').value = '';
}

async function deleteSeguro(id) {
    try {
        await SegurosAPI.deletar(id);
        Utils.showToast('Seguro excluído com sucesso!', 'success');
        await loadTableSeguros();
    } catch (error) {
        Utils.showToast('Erro ao excluir seguro', 'error');
    }
}

// =============================================
// MANUTENÇÕES
// =============================================

async function loadTableManutencoes() {
    try {
        const data = await ManutencoesAPI.listar();
        const tbody = document.querySelector('#tableManutencoes tbody');
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Nenhuma manutenção registrada</td></tr>';
            return;
        }

        data.forEach(item => {
            tbody.innerHTML += `
                <tr>
                    <td>${Utils.formatDate(item.data)}</td>
                    <td><strong>${item.placa}</strong></td>
                    <td>${item.descricao ? (item.descricao.substring(0, 50) + (item.descricao.length > 50 ? '...' : '')) : '-'}</td>
                    <td>${item.mecanico || '-'}</td>
                    <td>${Utils.formatCurrency(item.valor)}</td>
                    <td class="actions">
                        <button class="btn btn-sm btn-secondary" onclick="editManutencao('${item.id}')">
                            <i class="ph ph-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="confirmDelete('manutencao', '${item.id}')">
                            <i class="ph ph-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Erro ao carregar manutenções:', error);
    }
}

async function saveManutencao(event) {
    event.preventDefault();
    
    const id = document.getElementById('manutencaoId').value;
    const dados = {
        placa: document.getElementById('manutencaoPlaca').value,
        data: document.getElementById('manutencaoData').value,
        descricao: document.getElementById('manutencaoDescricao').value,
        mecanico: document.getElementById('manutencaoMecanico').value,
        valor: parseFloat(document.getElementById('manutencaoValor').value) || 0
    };

    try {
        if (id) {
            await ManutencoesAPI.atualizar(id, dados);
            Utils.showToast('Manutenção atualizada com sucesso!', 'success');
        } else {
            await ManutencoesAPI.criar(dados);
            Utils.showToast('Manutenção registrada com sucesso!', 'success');
        }
        clearFormManutencao();
        await loadTableManutencoes();
    } catch (error) {
        Utils.showToast('Erro ao salvar manutenção: ' + error.message, 'error');
    }
}

async function editManutencao(id) {
    try {
        const item = await SupabaseClient.getById('frota_manutencoes', id);
        if (item) {
            document.getElementById('manutencaoId').value = item.id;
            document.getElementById('manutencaoPlaca').value = item.placa;
            document.getElementById('manutencaoData').value = item.data || '';
            document.getElementById('manutencaoDescricao').value = item.descricao || '';
            document.getElementById('manutencaoMecanico').value = item.mecanico || '';
            document.getElementById('manutencaoValor').value = item.valor || '';
            showForm('manutencoes');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (error) {
        Utils.showToast('Erro ao carregar manutenção', 'error');
    }
}

function clearFormManutencao() {
    document.getElementById('formManutencao').reset();
    document.getElementById('manutencaoId').value = '';
}

async function deleteManutencao(id) {
    try {
        await ManutencoesAPI.deletar(id);
        Utils.showToast('Manutenção excluída com sucesso!', 'success');
        await loadTableManutencoes();
    } catch (error) {
        Utils.showToast('Erro ao excluir manutenção', 'error');
    }
}

// =============================================
// SINISTROS
// =============================================

async function loadTableSinistros() {
    try {
        const data = await SinistrosAPI.listar();
        const tbody = document.querySelector('#tableSinistros tbody');
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Nenhum sinistro registrado</td></tr>';
            return;
        }

        data.forEach(item => {
            const boLink = item.bo 
                ? `<a href="${item.bo}" target="_blank" class="btn btn-sm btn-primary"><i class="ph ph-file-pdf"></i> Ver</a>` 
                : '-';
            tbody.innerHTML += `
                <tr>
                    <td>${Utils.formatDate(item.data)}</td>
                    <td><strong>${item.placa}</strong></td>
                    <td>${item.descricao ? (item.descricao.substring(0, 50) + (item.descricao.length > 50 ? '...' : '')) : '-'}</td>
                    <td>${boLink}</td>
                    <td>${Utils.formatCurrency(item.valor)}</td>
                    <td class="actions">
                        <button class="btn btn-sm btn-secondary" onclick="editSinistro('${item.id}')">
                            <i class="ph ph-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="confirmDelete('sinistro', '${item.id}')">
                            <i class="ph ph-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Erro ao carregar sinistros:', error);
    }
}

async function saveSinistro(event) {
    event.preventDefault();
    
    const id = document.getElementById('sinistroId').value;
    const dados = {
        placa: document.getElementById('sinistroPlaca').value,
        data: document.getElementById('sinistroData').value,
        descricao: document.getElementById('sinistroDescricao').value,
        bo: document.getElementById('sinistroBO').value,
        valor: parseFloat(document.getElementById('sinistroValor').value) || 0
    };

    try {
        if (id) {
            await SinistrosAPI.atualizar(id, dados);
            Utils.showToast('Sinistro atualizado com sucesso!', 'success');
        } else {
            await SinistrosAPI.criar(dados);
            Utils.showToast('Sinistro registrado com sucesso!', 'success');
        }
        clearFormSinistro();
        await loadTableSinistros();
    } catch (error) {
        Utils.showToast('Erro ao salvar sinistro: ' + error.message, 'error');
    }
}

async function editSinistro(id) {
    try {
        const item = await SupabaseClient.getById('frota_sinistros', id);
        if (item) {
            document.getElementById('sinistroId').value = item.id;
            document.getElementById('sinistroPlaca').value = item.placa;
            document.getElementById('sinistroData').value = item.data || '';
            document.getElementById('sinistroDescricao').value = item.descricao || '';
            document.getElementById('sinistroBO').value = item.bo || '';
            document.getElementById('sinistroValor').value = item.valor || '';
            showForm('sinistros');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (error) {
        Utils.showToast('Erro ao carregar sinistro', 'error');
    }
}

function clearFormSinistro() {
    document.getElementById('formSinistro').reset();
    document.getElementById('sinistroId').value = '';
}

async function deleteSinistro(id) {
    try {
        await SinistrosAPI.deletar(id);
        Utils.showToast('Sinistro excluído com sucesso!', 'success');
        await loadTableSinistros();
    } catch (error) {
        Utils.showToast('Erro ao excluir sinistro', 'error');
    }
}

// =============================================
// ABASTECIMENTOS
// =============================================

async function loadTableAbastecimentos() {
    try {
        const data = await AbastecimentosAPI.listar();
        const tbody = document.querySelector('#tableAbastecimentos tbody');
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Nenhum abastecimento registrado</td></tr>';
            return;
        }

        data.forEach(item => {
            tbody.innerHTML += `
                <tr>
                    <td>${Utils.formatDate(item.data)}</td>
                    <td><strong>${item.placa}</strong></td>
                    <td>${parseFloat(item.litros || 0).toFixed(2)} L</td>
                    <td>${Utils.formatCurrency(item.valor_unitario)}</td>
                    <td>${Utils.formatCurrency(item.valor_total)}</td>
                    <td class="actions">
                        <button class="btn btn-sm btn-secondary" onclick="editAbastecimento('${item.id}')">
                            <i class="ph ph-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="confirmDelete('abastecimento', '${item.id}')">
                            <i class="ph ph-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Erro ao carregar abastecimentos:', error);
    }
}

async function saveAbastecimento(event) {
    event.preventDefault();
    
    const id = document.getElementById('abastecimentoId').value;
    const dados = {
        placa: document.getElementById('abastecimentoPlaca').value,
        data: document.getElementById('abastecimentoData').value,
        litros: parseFloat(document.getElementById('abastecimentoLitros').value) || 0,
        valor_unitario: parseFloat(document.getElementById('abastecimentoValorUnitario').value) || 0,
        valor_total: parseFloat(document.getElementById('abastecimentoValorTotal').value) || 0
    };

    try {
        if (id) {
            await AbastecimentosAPI.atualizar(id, dados);
            Utils.showToast('Abastecimento atualizado com sucesso!', 'success');
        } else {
            await AbastecimentosAPI.criar(dados);
            Utils.showToast('Abastecimento registrado com sucesso!', 'success');
        }
        clearFormAbastecimento();
        await loadTableAbastecimentos();
    } catch (error) {
        Utils.showToast('Erro ao salvar abastecimento: ' + error.message, 'error');
    }
}

async function editAbastecimento(id) {
    try {
        const item = await SupabaseClient.getById('frota_abastecimentos', id);
        if (item) {
            document.getElementById('abastecimentoId').value = item.id;
            document.getElementById('abastecimentoPlaca').value = item.placa;
            document.getElementById('abastecimentoData').value = item.data || '';
            document.getElementById('abastecimentoLitros').value = item.litros || '';
            document.getElementById('abastecimentoValorUnitario').value = item.valor_unitario || '';
            document.getElementById('abastecimentoValorTotal').value = item.valor_total || '';
            showForm('abastecimentos');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (error) {
        Utils.showToast('Erro ao carregar abastecimento', 'error');
    }
}

function clearFormAbastecimento() {
    document.getElementById('formAbastecimento').reset();
    document.getElementById('abastecimentoId').value = '';
}

async function deleteAbastecimento(id) {
    try {
        await AbastecimentosAPI.deletar(id);
        Utils.showToast('Abastecimento excluído com sucesso!', 'success');
        await loadTableAbastecimentos();
    } catch (error) {
        Utils.showToast('Erro ao excluir abastecimento', 'error');
    }
}

function calcularTotal() {
    const litros = parseFloat(document.getElementById('abastecimentoLitros').value) || 0;
    const valorUnitario = parseFloat(document.getElementById('abastecimentoValorUnitario').value) || 0;
    const total = litros * valorUnitario;
    document.getElementById('abastecimentoValorTotal').value = total.toFixed(2);
}

// =============================================
// FUNÇÕES AUXILIARES
// =============================================

function showForm(formName) {
    // Esconder todos os formulários
    const forms = ['veiculos', 'seguros', 'manutencoes', 'sinistros', 'abastecimentos'];
    forms.forEach(f => {
        document.getElementById(`form-${f}`).classList.add('hidden');
    });
    
    // Mostrar o formulário selecionado
    document.getElementById(`form-${formName}`).classList.remove('hidden');
    
    // Atualizar menu ativo
    document.querySelectorAll('.forms-menu-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.forms-menu-item').classList.add('active');
}

function confirmDelete(type, id) {
    const modal = document.getElementById('modal-delete');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    
    // Remover handler anterior para evitar duplicação
    const btnConfirm = document.getElementById('btnConfirmDelete');
    const newBtn = btnConfirm.cloneNode(true);
    btnConfirm.parentNode.replaceChild(newBtn, btnConfirm);
    
    newBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        switch(type) {
            case 'veiculo':
                await deleteVeiculo(id);
                break;
            case 'seguro':
                await deleteSeguro(id);
                break;
            case 'manutencao':
                await deleteManutencao(id);
                break;
            case 'sinistro':
                await deleteSinistro(id);
                break;
            case 'abastecimento':
                await deleteAbastecimento(id);
                break;
        }
        closeDeleteModal();
    });
}

function closeDeleteModal() {
    const modal = document.getElementById('modal-delete');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}
