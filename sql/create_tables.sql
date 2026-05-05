-- =============================================
-- Script para criar tabelas no Supabase
-- Controle de Frota - Young Empreendimentos
-- =============================================

-- 1. Tabela de Veículos
CREATE TABLE IF NOT EXISTS frota_veiculos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    placa TEXT NOT NULL UNIQUE,
    modelo TEXT,
    ano_modelo TEXT,
    renavam TEXT,
    ipva NUMERIC DEFAULT 0,
    dpvat NUMERIC DEFAULT 0,
    proprietario TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Seguros
CREATE TABLE IF NOT EXISTS frota_seguros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    placa TEXT NOT NULL,
    corretora TEXT,
    seguradora TEXT,
    vencimento DATE,
    valor_seguro NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Manutenções
CREATE TABLE IF NOT EXISTS frota_manutencoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    placa TEXT NOT NULL,
    data DATE,
    descricao TEXT,
    mecanico TEXT,
    valor NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Sinistros
CREATE TABLE IF NOT EXISTS frota_sinistros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    placa TEXT NOT NULL,
    data DATE,
    descricao TEXT,
    bo TEXT,
    valor NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Abastecimentos
CREATE TABLE IF NOT EXISTS frota_abastecimentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    placa TEXT NOT NULL,
    data DATE,
    litros NUMERIC DEFAULT 0,
    valor_unitario NUMERIC DEFAULT 0,
    valor_total NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Índices para melhor performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_frota_veiculos_placa ON frota_veiculos(placa);
CREATE INDEX IF NOT EXISTS idx_frota_seguros_placa ON frota_seguros(placa);
CREATE INDEX IF NOT EXISTS idx_frota_manutencoes_placa ON frota_manutencoes(placa);
CREATE INDEX IF NOT EXISTS idx_frota_manutencoes_data ON frota_manutencoes(data);
CREATE INDEX IF NOT EXISTS idx_frota_sinistros_placa ON frota_sinistros(placa);
CREATE INDEX IF NOT EXISTS idx_frota_sinistros_data ON frota_sinistros(data);
CREATE INDEX IF NOT EXISTS idx_frota_abastecimentos_placa ON frota_abastecimentos(placa);
CREATE INDEX IF NOT EXISTS idx_frota_abastecimentos_data ON frota_abastecimentos(data);

-- =============================================
-- Desabilitar RLS para acesso público (sem autenticação)
-- =============================================

ALTER TABLE frota_veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE frota_seguros ENABLE ROW LEVEL SECURITY;
ALTER TABLE frota_manutencoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE frota_sinistros ENABLE ROW LEVEL SECURITY;
ALTER TABLE frota_abastecimentos ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso público (anon)
CREATE POLICY "Allow public read frota_veiculos" ON frota_veiculos FOR SELECT USING (true);
CREATE POLICY "Allow public insert frota_veiculos" ON frota_veiculos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update frota_veiculos" ON frota_veiculos FOR UPDATE USING (true);
CREATE POLICY "Allow public delete frota_veiculos" ON frota_veiculos FOR DELETE USING (true);

CREATE POLICY "Allow public read frota_seguros" ON frota_seguros FOR SELECT USING (true);
CREATE POLICY "Allow public insert frota_seguros" ON frota_seguros FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update frota_seguros" ON frota_seguros FOR UPDATE USING (true);
CREATE POLICY "Allow public delete frota_seguros" ON frota_seguros FOR DELETE USING (true);

CREATE POLICY "Allow public read frota_manutencoes" ON frota_manutencoes FOR SELECT USING (true);
CREATE POLICY "Allow public insert frota_manutencoes" ON frota_manutencoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update frota_manutencoes" ON frota_manutencoes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete frota_manutencoes" ON frota_manutencoes FOR DELETE USING (true);

CREATE POLICY "Allow public read frota_sinistros" ON frota_sinistros FOR SELECT USING (true);
CREATE POLICY "Allow public insert frota_sinistros" ON frota_sinistros FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update frota_sinistros" ON frota_sinistros FOR UPDATE USING (true);
CREATE POLICY "Allow public delete frota_sinistros" ON frota_sinistros FOR DELETE USING (true);

CREATE POLICY "Allow public read frota_abastecimentos" ON frota_abastecimentos FOR SELECT USING (true);
CREATE POLICY "Allow public insert frota_abastecimentos" ON frota_abastecimentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update frota_abastecimentos" ON frota_abastecimentos FOR UPDATE USING (true);
CREATE POLICY "Allow public delete frota_abastecimentos" ON frota_abastecimentos FOR DELETE USING (true);

-- =============================================
-- Função para atualizar updated_at automaticamente
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_frota_veiculos_updated_at BEFORE UPDATE ON frota_veiculos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_frota_seguros_updated_at BEFORE UPDATE ON frota_seguros FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_frota_manutencoes_updated_at BEFORE UPDATE ON frota_manutencoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_frota_sinistros_updated_at BEFORE UPDATE ON frota_sinistros FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_frota_abastecimentos_updated_at BEFORE UPDATE ON frota_abastecimentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
