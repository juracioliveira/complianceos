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
  '1.0',
  'ACTIVE',
  365,
  ARRAY['CLIENTE', 'PARCEIRO']::VARCHAR[],
  '[
    {"id":"pld_001","order":1,"question":"A empresa possui política PLD/FT documentada e aprovada pelo Conselho de Administração ou Diretoria?","weight":15,"category":"POLITICAS","regulationRef":"Art. 9, Lei 9.613/98","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":"Considere aprovada apenas política formalizada com assinatura digital ou ata de reunião."},
    {"id":"pld_002","order":2,"question":"Existe programa de treinamento periódico (mínimo anual) em PLD/FT para todos os colaboradores?","weight":10,"category":"TREINAMENTO","regulationRef":"Art. 9, §1, Lei 9.613/98","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":"Documentar lista de presença ou certificado de conclusão."},
    {"id":"pld_003","order":3,"question":"A empresa possui processo formal de identificação e verificação de clientes (KYC)?","weight":15,"category":"KYC","regulationRef":"Art. 10, Lei 9.613/98","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":"Verificar procedimento documentado com etapas de coleta e validação de documentos."},
    {"id":"pld_004","order":4,"question":"Existe processo de avaliação de pessoas expostas politicamente (PEP) entre sócios e beneficiários finais?","weight":10,"category":"PEP","regulationRef":"Res. BACEN 4.753/2019 Art. 5","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":""},
    {"id":"pld_005","order":5,"question":"A empresa realiza monitoramento contínuo de transações para detecção de operações suspeitas?","weight":15,"category":"MONITORAMENTO","regulationRef":"Art. 11, Lei 9.613/98","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":"Sistemas automatizados ou processos manuais documentados são aceitos."},
    {"id":"pld_006","order":6,"question":"Qual o nível de implementação do monitoramento de transações?","weight":10,"category":"MONITORAMENTO","regulationRef":"Art. 11, Lei 9.613/98","answerType":"SCALE","options":null,"evidenceRequired":false,"helpText":"0 = não implementado; 100 = totalmente automatizado com alertas em tempo real."},
    {"id":"pld_007","order":7,"question":"A empresa possui canal de comunicação de operações suspeitas ao COAF (ou ao obrigado legal)?","weight":15,"category":"COMUNICACAO","regulationRef":"Art. 11, §1, Lei 9.613/98","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":""},
    {"id":"pld_008","order":8,"question":"Existem controles para evitar relacionamento com Empresas Fictícias (shell companies) e lavagem via terceiros?","weight":10,"category":"CONTROLES","regulationRef":"Res. BACEN 4.753/2019 Art. 12","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":""},
    {"id":"pld_009","order":9,"question":"A empresa realiza screening periódico em listas de sanções (OFAC, ONU, Receita Federal — CNPJ irregular)?","weight":10,"category":"SANCOES","regulationRef":"Res. BACEN 4.753/2019 Art. 15","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":"Screening mínimo semestral; mensal para clientes de alto risco."},
    {"id":"pld_010","order":10,"question":"Com que frequência os registros de KYC dos clientes são revisados e atualizados?","weight":5,"category":"KYC","regulationRef":"Art. 10, §4, Lei 9.613/98","answerType":"MULTIPLE_CHOICE","options":["Nunca ou raramente","Apenas no onboarding","Anualmente","Semestralmente","Trimestralmente ou mais frequente"],"evidenceRequired":false,"helpText":""}
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
  '1.0',
  'ACTIVE',
  180,
  ARRAY['CLIENTE', 'PARCEIRO', 'FORNECEDOR']::VARCHAR[],
  '[
    {"id":"edd_001","order":1,"question":"A empresa possui beneficiário final identificado e documentado (ownership ≥25%)?","weight":20,"category":"BENEFICIARIO_FINAL","regulationRef":"Res. BACEN 4.753/2019 Art. 7","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":"Identificar cadeia de controle até pessoa física final."},
    {"id":"edd_002","order":2,"question":"Fonte de renda e origem dos recursos do beneficiário final está verificada e documentada?","weight":20,"category":"ORIGEM_RECURSOS","regulationRef":"Res. BACEN 4.753/2019 Art. 8","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":""},
    {"id":"edd_003","order":3,"question":"A empresa está ativa na Receita Federal (situação cadastral regular)?","weight":15,"category":"KYB","regulationRef":"Art. 10, Lei 9.613/98","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":"Consultar sitfiscal.rfb.gov.br ou API da Receita Federal."},
    {"id":"edd_004","order":4,"question":"A empresa ou seus sócios figuram em alguma lista de sanções ou processos criminais relevantes?","weight":25,"category":"SANCOES","regulationRef":"Res. BACEN 4.753/2019 Art. 15","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":"Verificar OFAC SDN, Lista da ONU, Lista COAF e pesquisa jurisprudencial."},
    {"id":"edd_005","order":5,"question":"Existe justificativa econômica plausível para o volume de operações declarado?","weight":20,"category":"MONITORAMENTO","regulationRef":"Art. 11, Lei 9.613/98","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":""}
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
  '1.0',
  'ACTIVE',
  365,
  ARRAY['CLIENTE', 'FORNECEDOR', 'PARCEIRO']::VARCHAR[],
  '[
    {"id":"lgpd_001","order":1,"question":"A empresa possui Registro de Atividades de Tratamento (RAT) documentado e atualizado?","weight":20,"category":"RAT","regulationRef":"Art. 37, LGPD","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":"O RAT deve mapear: finalidade, base legal, dados tratados, titulares, destinatários, prazo de retenção."},
    {"id":"lgpd_002","order":2,"question":"Todas as atividades de tratamento possuem base legal identificada (Art. 7 ou Art. 11 da LGPD)?","weight":15,"category":"BASE_LEGAL","regulationRef":"Art. 7, LGPD","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":"Bases legais: consentimento, legítimo interesse, obrigação legal, execução de contrato, etc."},
    {"id":"lgpd_003","order":3,"question":"A empresa nomeou um Encarregado de Dados (DPO)?","weight":10,"category":"GOVERNANCA","regulationRef":"Art. 41, LGPD","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":"O DPO pode ser interno ou externo. Publicar nome e contato no site (Art. 41, §1)."},
    {"id":"lgpd_004","order":4,"question":"Existem políticas de privacidade e retenção de dados documentadas e acessíveis aos titulares?","weight":10,"category":"TRANSPARENCIA","regulationRef":"Art. 9, LGPD","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":""},
    {"id":"lgpd_005","order":5,"question":"Existe processo formal para atendimento de requisições de titulares (acesso, correção, exclusão, portabilidade)?","weight":15,"category":"DIREITOS_TITULARES","regulationRef":"Art. 18, LGPD","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":"SLA máximo para resposta: 15 dias (conforme Res. CD/ANPD 02/2022)."},
    {"id":"lgpd_006","order":6,"question":"Os contratos com agentes de tratamento terceiros (subprocessadores) possuem cláusulas de proteção de dados?","weight":10,"category":"TERCEIROS","regulationRef":"Art. 39, LGPD","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":"Verificar DPAs (Data Processing Agreements) em todos os contratos com fornecedores de TI, RH, marketing, etc."},
    {"id":"lgpd_007","order":7,"question":"Existe processo documentado de gestão de incidentes (notificação à ANPD e titulares)?","weight":15,"category":"INCIDENTES","regulationRef":"Art. 48, LGPD","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":"Prazo de notificação à ANPD: 2 dias úteis após conhecimento do incidente grave (Res. CD/ANPD 01/2021)."},
    {"id":"lgpd_008","order":8,"question":"A empresa realiza Privacy by Design na concepção de novos produtos e sistemas?","weight":5,"category":"GOVERNANCA","regulationRef":"Art. 46, §2, LGPD","answerType":"MULTIPLE_CHOICE","options":["Não implementado","Em planejamento","Parcialmente","Totalmente implementado"],"evidenceRequired":false,"helpText":""}
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
  '1.0',
  'ACTIVE',
  365,
  ARRAY['CLIENTE', 'FORNECEDOR', 'PARCEIRO']::VARCHAR[],
  '[
    {"id":"ac_001","order":1,"question":"A empresa possui comprometimento formal da Alta Direção com o Programa de Integridade (tone at the top)?","weight":15,"category":"COMPROMETIMENTO","regulationRef":"Art. 7, III, Lei 12.846/13","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":"Manifestação formal via política, carta, vídeo institucional ou comunicação interna datada."},
    {"id":"ac_002","order":2,"question":"Existe Código de Conduta e Ética documentado, aprovado e comunicado a todos os colaboradores?","weight":15,"category":"CODIGO_CONDUTA","regulationRef":"Decreto 11.129/2022 Art. 57, II","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":"O código deve abordar: conflito de interesses, brindes, hospitalidade, propina, fraude."},
    {"id":"ac_003","order":3,"question":"A empresa possui Canal de Denúncias anônimo e independente?","weight":15,"category":"CANAL_DENUNCIA","regulationRef":"Decreto 11.129/2022 Art. 57, IV, d","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":"O canal deve ser acessível 24h, garantir sigilo e ter governança independente da área denunciada."},
    {"id":"ac_004","order":4,"question":"Existe processo de due diligence de terceiros (fornecedores, parceiros, intermediários) com avaliação anticorrupção?","weight":20,"category":"TERCEIROS","regulationRef":"Art. 7, VIII, Lei 12.846/13","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":"Verificar consulta a listas de impedimentos: CEIS, CNEP, BNDES, sócios envolvidos em processos."},
    {"id":"ac_005","order":5,"question":"A empresa realiza treinamentos periódicos em ética e anticorrupção?","weight":10,"category":"TREINAMENTO","regulationRef":"Decreto 11.129/2022 Art. 57, IV, c","answerType":"BOOLEAN","options":null,"evidenceRequired":true,"helpText":"Mínimo anual. Documentar lista de presença e conteúdo programático."},
    {"id":"ac_006","order":6,"question":"Existem controles internos e procedimentos para prevenção de fraude e corrupção nas áreas críticas (licitações, pagamentos)?","weight":15,"category":"CONTROLES","regulationRef":"Decreto 11.129/2022 Art. 57, IV, f","answerType":"BOOLEAN","options":null,"evidenceRequired":false,"helpText":"Áreas críticas: compras, pagamentos, contratações públicas, relações com agentes públicos."},
    {"id":"ac_007","order":7,"question":"O Programa de Integridade é monitorado e atualizado periodicamente?","weight":10,"category":"MONITORAMENTO","regulationRef":"Decreto 11.129/2022 Art. 57, IV, g","answerType":"MULTIPLE_CHOICE","options":["Não monitorado","Monitorado informalmente","Revisão anual formal","Revisão semestral com relatório à diretoria"],"evidenceRequired":false,"helpText":""}
  ]'::JSONB
);

-- DOWN: DELETE FROM checklists WHERE tenant_id IS NULL AND regulation_code IN ('LEI_9613_98_CDD','LEI_9613_98_EDD','LGPD_ART37_RAT','LEI_12846_13_PI');
