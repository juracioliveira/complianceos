import undici from 'undici';

export async function getLatestCompetencia(): Promise<string> {
    const baseUrl = process.env.RFB_BASE_URL || 'https://arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj';

    const { statusCode, body } = await undici.request(baseUrl);

    if (statusCode !== 200) {
        throw new Error(`Failed to fetch RFB index. Status code: ${statusCode}`);
    }

    const html = await body.text();

    // Regex to match "YYYY-MM/" format from hrefs, ex: href="2026-01/"
    const regex = /href="(\d{4}-\d{2})\/"/g;
    let match;
    const folders: string[] = [];

    while ((match = regex.exec(html)) !== null) {
        if (match[1]) folders.push(match[1]);
    }

    if (folders.length === 0) {
        throw new Error('No YYYY-MM folders found at RFB Open Data root URL');
    }

    // Sort descending and pick the latest one
    folders.sort((a, b) => b.localeCompare(a));

    return folders[0] as string;
}

export const zipFilesList = [
    'Empresas0.zip', 'Empresas1.zip', 'Empresas2.zip', 'Empresas3.zip', 'Empresas4.zip',
    'Empresas5.zip', 'Empresas6.zip', 'Empresas7.zip', 'Empresas8.zip', 'Empresas9.zip',
    'Estabelecimentos0.zip', 'Estabelecimentos1.zip', 'Estabelecimentos2.zip', 'Estabelecimentos3.zip', 'Estabelecimentos4.zip',
    'Estabelecimentos5.zip', 'Estabelecimentos6.zip', 'Estabelecimentos7.zip', 'Estabelecimentos8.zip', 'Estabelecimentos9.zip',
    'Socios0.zip', 'Socios1.zip', 'Socios2.zip', 'Socios3.zip', 'Socios4.zip',
    'Socios5.zip', 'Socios6.zip', 'Socios7.zip', 'Socios8.zip', 'Socios9.zip',
    'Simples.zip', 'Cnaes.zip', 'Municipios.zip', 'Naturezas.zip',
    'Qualificacoes.zip', 'Motivos.zip', 'Paises.zip'
];
