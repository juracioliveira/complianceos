import { describe, it, expect } from 'vitest';
import { normalizeName, maskDocument, maskName } from '../../src/utils/nameNormalizer.js';

describe('nameNormalizer', () => {
    it('Normalizes basic name correctly by sorting tokens', () => {
        expect(normalizeName('Putin Vladimir')).toBe('PUTIN VLADIMIR');
        expect(normalizeName('Vladimir Putin')).toBe('PUTIN VLADIMIR');
    });

    it('Removes accents and diacritics', () => {
        expect(normalizeName('Vladímir Pùtin')).toBe('PUTIN VLADIMIR');
        expect(normalizeName('João da Silva')).toBe('DA JOAO SILVA');
    });

    it('Removes punctuation and extra spaces', () => {
        expect(normalizeName('PUTIN, Vladimir Vladimirovich')).toBe('PUTIN VLADIMIR VLADIMIROVICH');
        expect(normalizeName('AL-QAEDA')).toBe('AL QAEDA');
        expect(normalizeName('Bin Laden, Osama')).toBe('BIN LADEN OSAMA');
    });
});

describe('maskDocument', () => {
    it('Masks generic IDs or documents to last 4 digits', () => {
        expect(maskDocument('12345678901')).toBe('*******8901');
        expect(maskDocument('AB1234567')).toBe('*****4567');
    });
});

describe('maskName', () => {
    it('Truncates the first name for PII safety in logs', () => {
        expect(maskName('Vladimir Putin')).toBe('Vla***');
        expect(maskName('João Silva')).toBe('Joã***');
        expect(maskName('Al Qaeda')).toBe('Al***');
    });
});
