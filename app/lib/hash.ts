import CryptoJS from "crypto-js";

/**
 * Generates a SHA-256 hash for product tracking (simulates blockchain hash).
 */
export function generateProductHash(data: {
    codigo: string;
    nome: string;
    origem: string;
    timestamp: string;
}): string {
    const raw = `${data.codigo}:${data.nome}:${data.origem}:${data.timestamp}`;
    return CryptoJS.SHA256(raw).toString();
}

/**
 * Generates a SHA-256 hash for a tracking event.
 */
export function generateEventHash(data: {
    productHash: string;
    estado: string;
    localizacao: string;
    timestamp: string;
}): string {
    const raw = `${data.productHash}:${data.estado}:${data.localizacao}:${data.timestamp}`;
    return CryptoJS.SHA256(raw).toString();
}

/**
 * Returns a shortened version of a hash for display.
 */
export function shortenHash(hash: string, chars = 8): string {
    return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}
