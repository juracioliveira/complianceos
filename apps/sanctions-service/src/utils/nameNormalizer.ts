export function normalizeName(name: string): string {
    if (!name) return '';

    return name
        .normalize('NFD')                     // decompõe caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '')      // remove diacríticos (acentos)
        .toUpperCase()                        // converte para maiúsculas
        .replace(/[^A-Z0-9\s]/g, ' ')         // remove pontuação (mantém letras, números e espaços)
        .replace(/\s+/g, ' ')                 // substitui múltiplos espaços por um só
        .trim()                               // remove espaços nas bordas
        .split(' ')                           // divide em tokens (palavras)
        .filter(Boolean)                      // remove tokens vazios por garantia
        .sort()                               // ordena alfabeticamente para ignorar ordem ("NAME LAST" == "LAST NAME")
        .join(' ');                           // junta tudo novamente
}

export function maskDocument(doc: string): string {
    if (!doc) return '';
    const clean = doc.replace(/[^\w\d]/g, '');
    if (clean.length <= 4) return '***';

    // Mascara tudo exceto os últimos 4 dígitos
    return clean.substring(0, clean.length - 4).replace(/./g, '*') + clean.slice(-4);
}

export function maskName(name: string): string {
    if (!name) return '';
    const firstTokens = name.trim().split(' ')[0] || '';
    if (firstTokens.length <= 3) return firstTokens + '***';
    return firstTokens.substring(0, 3) + '***';
}
