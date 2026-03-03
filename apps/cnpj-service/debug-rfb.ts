import undici from 'undici';

async function testFetch() {
    const baseUrl = 'https://dadosabertos.rfb.gov.br/CNPJ/';
    console.log(`Fetching ${baseUrl}...`);
    try {
        const { statusCode, body } = await undici.request(baseUrl);
        console.log(`Status: ${statusCode}`);
        const html = await body.text();
        console.log(`HTML Length: ${html.length}`);

        const regex = /href="(\d{4}-\d{2})\/"/g;
        let match;
        const folders = [];
        while ((match = regex.exec(html)) !== null) {
            if (match[1]) folders.push(match[1]);
        }
        console.log(`Folders found:`, folders);
    } catch (e) {
        console.error(`Error:`, e);
    }
}

testFetch();
