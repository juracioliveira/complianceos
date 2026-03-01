import { describe, it, expect } from 'vitest';
import { isValidCNPJ, formatCNPJ } from '../../src/utils/cnpj.js';

describe('CNPJ Validator', () => {
    it('Validates a correct CNPJ', () => {
        expect(isValidCNPJ('11222333000181')).toBe(true);
        // Format shouldn't matter as non-digits are stripped
        expect(isValidCNPJ('11.222.333/0001-81')).toBe(true);
    });

    it('Rejects invalid verification digits', () => {
        expect(isValidCNPJ('11222333000182')).toBe(false);
    });

    it('Rejects repeated sequences', () => {
        expect(isValidCNPJ('11111111111111')).toBe(false);
        expect(isValidCNPJ('00000000000000')).toBe(false);
    });

    it('Rejects wrong lengths', () => {
        expect(isValidCNPJ('11222333')).toBe(false);
    });
});

describe('CNPJ Formatter', () => {
    it('Formats plain text', () => {
        expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81');
    });

    it('Keeps unchanged if too short', () => {
        expect(formatCNPJ('123456')).toBe('123456');
    });
});
