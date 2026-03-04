-- Migration: 0013_seed_system_checklists.sql
-- Sementes dos checklists do sistema (tenant_id = NULL = disponíveis para todos)
-- Base legal: Lei 9.613/98, Lei 13.709/18, Lei 12.846/13

-- ─────────────────────────────────────────────────────────────────
-- PLD-FT: Due Diligence Simplificada (CDD) — Lei 9.613/98 Art. 10
-- ─────────────────────────────────────────────────────────────────
INSERT INTO checklists (
  tenant_id, module, regulation_code, title, description, version, status,
  periodicity_days, applies_to, items
) VALUES (
  NULL,
  'PLD_FT',
  'LEI_9613_98_CDD',
  'Due Diligence PLD/FT — Cliente Padrão (CDD)',
  'Checklist de conformidade com o Art. 10 da Lei 9.613/98 e Resolução BACEN 4.753/2019. Aplicável a clientes pessoa jurídica de risco médio.',
  '1.1',
  'ACTIVE',
  365,
  ARRAY['CLIENTE', 'PARCEIRO']::VARCHAR[],
  '[
    {"id":"pld_cdd_001","order":1,"question":"A empresa possui política PLD/FT documentada e aprovada pela Alta Direção?","weight":15,"category":"GOVERNANCA","regulationRef":"Art. 9, Lei 9.613/98","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":"Verifique assinatura digital ou ata de aprovação."},
    {"id":"pld_cdd_002","order":2,"question":"Existe nomeação formal de um Diretor Responsável (CCO) perante os órgãos reguladores?","weight":10,"category":"GOVERNANCA","regulationRef":"Res. BACEN 4.753/2019 Art. 4","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":""},
    {"id":"pld_cdd_003","order":3,"question":"O processo de identificação de clientes (KYC) inclui a coleta de documentos de constituição e identificação de sócios?","weight":15,"category":"KYC","regulationRef":"Art. 10, I, Lei 9.613/98","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":""},
    {"id":"pld_cdd_004","order":4,"question":"A identificação do Beneficiário Final (UBO) é realizada para participações superiores a 25%?","weight":15,"category":"KYC","regulationRef":"Circular BACEN 3.978/2020","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":""},
    {"id":"pld_cdd_005","order":5,"question":"É realizado screening automatizado em listas de sanções (OFAC, ONU, etc) no momento do cadastro?","weight":15,"category":"SANCOES","regulationRef":"Lei 13.810/2019","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":""},
    {"id":"pld_cdd_006","order":6,"question":"Existe verificação de Pessoas Expostas Politicamente (PEP) no onboarding?","weight":15,"category":"PEP","regulationRef":"Res. COAF 40/2021","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":""},
    {"id":"pld_cdd_007","order":7,"question":"Qual o nível de automação do monitoramento de transações atípicas?","weight":10,"category":"MONITORAMENTO","regulationRef":"Art. 11, Lei 9.613/98","answerType":"SCALE","options":null,"evidenceRequired":false,"helpText":"0 = Manual; 100 = Totalmente Automatizado."},
    {"id":"pld_cdd_008","order":8,"question":"A empresa possui canal de reporte ao COAF via SISCOAF ativo?","weight":5,"category":"COMUNICACAO","regulationRef":"Art. 11, Lei 9.613/98","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":""}
  ]'::JSONB
);

-- ─────────────────────────────────────────────────────────────────
-- PLD-FT: Due Diligence Reforçada (EDD) — Alto Risco
-- ─────────────────────────────────────────────────────────────────
INSERT INTO checklists (
  tenant_id, module, regulation_code, title, description, version, status,
  periodicity_days, applies_to, items
) VALUES (
  NULL,
  'PLD_FT',
  'LEI_9613_98_EDD',
  'Due Diligence Reforçada PLD/FT (EDD) — Alto Risco',
  'Checklist aprofundado para clientes e parceiros classificados como Alto Risco ou Crítico. Requerimentos da Resolução BACEN 4.753/2019 para EDD.',
  '1.1',
  'ACTIVE',
  180,
  ARRAY['CLIENTE', 'PARCEIRO', 'FORNECEDOR']::VARCHAR[],
  '[
    {"id":"pld_edd_001","order":1,"question":"A origem dos recursos e a fonte da riqueza do cliente foram devidamente comprovadas?","weight":25,"category":"ORIGEM_RECURSOS","regulationRef":"Res. BACEN 4.753/2019 Art. 8","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":"Exigir IR, Extratos ou documentos de venda de ativos."},
    {"id":"pld_edd_002","order":2,"question":"Foi obtida aprovação prévia da Alta Direção para o início ou manutenção do relacionamento?","weight":20,"category":"GOVERNANCA","regulationRef":"Res. BACEN 4.753/2019 Art. 14","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":"Ata de comitê ou assinatura de Diretor estatutário."},
    {"id":"pld_edd_003","order":3,"question":"Foi realizada visita in loco ou entrevista por videoconferência gravada com os administradores?","weight":15,"category":"KYC_AVANCADO","regulationRef":"Melhores Práticas GAFI/FATF","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":""},
    {"id":"pld_edd_004","order":4,"question":"A estrutura de controle societário foi mapeada até o nível de pessoa física, sem lacunas?","weight":20,"category":"UBO","regulationRef":"Circular BACEN 3.978/2020","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":""},
    {"id":"pld_edd_005","order":5,"question":"O monitoramento de transações para este cliente é realizado em regime de prioridade (T+0)?","weight":20,"category":"MONITORAMENTO","regulationRef":"Art. 11, Lei 9.613/98","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":""}
  ]'::JSONB
);

-- ─────────────────────────────────────────────────────────────────
-- LGPD: Registro de Atividades de Tratamento (RAT) — Art. 37
-- ─────────────────────────────────────────────────────────────────
INSERT INTO checklists (
  tenant_id, module, regulation_code, title, description, version, status,
  periodicity_days, applies_to, items
) VALUES (
  NULL,
  'LGPD',
  'LGPD_ART37_RAT',
  'Mapeamento LGPD — Registro de Atividades de Tratamento (RAT)',
  'Checklist para levantamento do Registro de Atividades de Tratamento de Dados Pessoais conforme Art. 37 da LGPD e Resolução CD/ANPD 02/2022.',
  '1.1',
  'ACTIVE',
  365,
  ARRAY['CLIENTE', 'FORNECEDOR', 'PARCEIRO']::VARCHAR[],
  '[
    {"id":"lgpd_rat_001","order":1,"question":"As finalidades do tratamento estão claramente específicas e legítimas para cada processo?","weight":15,"category":"FINALIDADE","regulationRef":"Art. 6, I, LGPD","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":""},
    {"id":"lgpd_rat_002","order":2,"question":"Foi identificada a Base Legal (Art. 7 ou 11) para cada operação de tratamento?","weight":15,"category":"BASE_LEGAL","regulationRef":"Art. 7, LGPD","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":"Consentimento, Execução de Contrato, Legítimo Interesse, etc."},
    {"id":"lgpd_rat_003","order":3,"question":"O inventário descreve as categorias de dados pessoais (comuns, sensíveis, de menores)?","weight":12,"category":"CATEGORIZACAO","regulationRef":"Art. 37, LGPD","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":""},
    {"id":"lgpd_rat_004","order":4,"question":"As categorias de titulares afetados (clientes, funcionários, dependentes) foram mapeadas?","weight":10,"category":"TITULARES","regulationRef":"Art. 37, LGPD","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":""},
    {"id":"lgpd_rat_005","order":5,"question":"Existem prazos de retenção e critérios de descarte definidos para os dados?","weight":12,"category":"CICLO_VIDA","regulationRef":"Art. 15, LGPD","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":""},
    {"id":"lgpd_rat_006","order":6,"question":"O compartilhamento de dados com terceiros (operadores) está documentado com a respectiva finalidade?","weight":12,"category":"COMPARTILHAMENTO","regulationRef":"Art. 37, LGPD","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":""},
    {"id":"lgpd_rat_007","order":7,"question":"Ocorrem transferências internacionais de dados (ex: servidores em nuvem exterior)?","weight":12,"category":"TRANSF_INTERNACIONAL","regulationRef":"Art. 33, LGPD","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":""},
    {"id":"lgpd_rat_008","order":8,"question":"As medidas de segurança técnicas e administrativas adotadas estão descritas no registro?","weight":12,"category":"SEGURANCA","regulationRef":"Art. 46, LGPD","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":""}
  ]'::JSONB
);

-- ─────────────────────────────────────────────────────────────────
-- Anticorrupção: Programa de Integridade — Lei 12.846/13
-- ─────────────────────────────────────────────────────────────────
INSERT INTO checklists (
  tenant_id, module, regulation_code, title, description, version, status,
  periodicity_days, applies_to, items
) VALUES (
  NULL,
  'ANTICORRUPCAO',
  'LEI_12846_13_PI',
  'Programa de Integridade — Lei Anticorrupção (Lei 12.846/13)',
  'Avaliação do Programa de Integridade conforme Lei 12.846/13 (Lei Anticorrupção) e Decreto 11.129/2022. Baseado nos 5 pilares da CGU.',
  '1.1',
  'ACTIVE',
  365,
  ARRAY['CLIENTE', 'FORNECEDOR', 'PARCEIRO']::VARCHAR[],
  '[
    {"id":"ac_pi_001","order":1,"question":"[Pilar 1] Existe comprometimento formal e público da Alta Direção com a ética e integridade?","weight":15,"category":"COMPROMETIMENTO","regulationRef":"Dec. 11.129/22 Art. 57, I","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":"Atas de diretoria, vídeos institucionais ou cartas públicas."},
    {"id":"ac_pi_002","order":2,"question":"[Pilar 2] A instância responsável pelo programa possui autonomia e recursos materiais/humanos adequados?","weight":15,"category":"INSTANCIA_RESPONSAVEL","regulationRef":"Dec. 11.129/22 Art. 57, III","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":""},
    {"id":"ac_pi_003","order":3,"question":"[Pilar 3] A empresa realiza avaliação periódica de riscos de corrupção e os mitiga adequadamente?","weight":15,"category":"ANALISE_RISCO","regulationRef":"Dec. 11.129/22 Art. 57, IV","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":"Matriz de riscos atualizada nos últimos 12 meses."},
    {"id":"ac_pi_004","order":4,"question":"[Pilar 4] O Código de Ética abrange vedações a suborno e fraude em licitações e contratos públicos?","weight":10,"category":"CODIGO_CONDUTA","regulationRef":"Dec. 11.129/22 Art. 57, II","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":""},
    {"id":"ac_pi_005","order":5,"question":"[Pilar 4] Existe canal de denúncia independente, anônimo e com proteção contra retaliação?","weight":15,"category":"CANAL_DENUNCIA","regulationRef":"Dec. 11.129/22 Art. 57, IV, d","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":""},
    {"id":"ac_pi_006","order":6,"question":"[Pilar 4] É realizada Due Diligence de Integridade (DDI) em fornecedores e parceiros de alto risco?","weight":15,"category":"DUE_DILIGENCE","regulationRef":"Dec. 11.129/22 Art. 57, XIII","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":""},
    {"id":"ac_pi_007","order":7,"question":"[Pilar 5] O programa de integridade passa por monitoramento contínuo e auditorias independentes?","weight":10,"category":"MONITORAMENTO","regulationRef":"Dec. 11.129/22 Art. 57, IV, g","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":""},
    {"id":"ac_pi_008","order":8,"question":"Qual o percentual de colaboradores treinados em ética e anticorrupção no último ano?","weight":5,"category":"TREINAMENTO","regulationRef":"Dec. 11.129/22 Art. 57, IV, c","answerType":"SCALE","options":null,"evidenceRequired":false,"helpText":"0 = Nenhum; 100 = Todos."}
  ]'::JSONB
);

-- DOWN: DELETE FROM checklists WHERE tenant_id IS NULL AND regulation_code IN ('LEI_9613_98_CDD','LEI_9613_98_EDD','LGPD_ART37_RAT','LEI_12846_13_PI');
