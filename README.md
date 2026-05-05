# Dashboard Controle de Frota

Sistema de gerenciamento de frota de veículos com dashboard interativo e formulários para cadastro de dados.

## Estrutura do Projeto

```
Controledefrota/
├── index.html              # Dashboard principal
├── formularios.html        # Formulários CRUD
├── migrar-dados.html       # Ferramenta de migração
├── css/
│   └── styles.css          # Estilos compartilhados
├── js/
│   ├── supabase.js         # Cliente Supabase
│   ├── dashboard.js        # Lógica do dashboard
│   └── forms.js            # Lógica dos formulários
└── sql/
    └── create_tables.sql   # SQL para criar tabelas
```

## Configuração do Supabase

### 1. Criar as Tabelas

Acesse o painel do Supabase em https://supabase.com/dashboard e execute o SQL do arquivo `sql/create_tables.sql` no **SQL Editor**.

As tabelas criadas serão:
- `frota_veiculos` - Cadastro de veículos
- `frota_seguros` - Dados de seguros
- `frota_manutencoes` - Histórico de manutenções
- `frota_sinistros` - Registro de sinistros
- `frota_abastecimentos` - Histórico de abastecimentos

### 2. Configurar Credenciais

As credenciais do Supabase estão configuradas no arquivo `js/supabase.js`:

```javascript
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_KEY = 'sua-chave-aqui';
```

## Como Usar

### Dashboard (`index.html`)

- Visualize dados de todos os veículos
- Selecione um veículo na barra lateral
- Veja KPIs: custos totais, abastecimentos, manutenções, sinistros
- Gráficos de distribuição e histórico mensal
- Tabelas detalhadas com registros

### Formulários (`formularios.html`)

- **Veículos**: Cadastre novos veículos com placa, modelo, ano, RENAVAM, IPVA, etc.
- **Seguros**: Registre apólices de seguro vinculadas aos veículos
- **Manutenções**: Registre serviços realizados com data, descrição e valor
- **Sinistros**: Registre acidentes com B.O. e custos
- **Abastecimentos**: Registre abastecimentos com litros e valores

### Migração de Dados (`migrar-dados.html`)

Ferramenta para importar dados existentes das planilhas do Google Sheets para o Supabase.

## Hospedagem

O projeto pode ser hospedado no GitHub Pages:

1. Faça push do código para um repositório GitHub
2. Vá em Settings > Pages
3. Selecione a branch `main` como source
4. O site estará disponível em `https://seuusuario.github.io/repositorio/`

## Tecnologias

- HTML5 / CSS3 / JavaScript (ES6+)
- [Supabase](https://supabase.com/) - Banco de dados PostgreSQL
- [Chart.js](https://www.chartjs.org/) - Gráficos
- [PapaParse](https://www.papaparse.com/) - Parser CSV
- [Phosphor Icons](https://phosphoricons.com/) - Ícones

## Segurança

⚠️ **Atenção**: A chave do Supabase está exposta no código JavaScript. Para produção:

1. Use apenas a **anon key** (não a service_role key)
2. Configure **Row Level Security (RLS)** adequadamente
3. Considere implementar autenticação se necessário
