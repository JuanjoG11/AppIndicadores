/**
 * Utility to lookup person names by ID (Cédula) in Colombia using ADRES.
 * Note: Since this is a frontend application, CORS will block direct requests to ADRES.
 * In a real production environment, this should be called through a backend proxy
 * or a Supabase Edge Function.
 */

export const lookupNameByCedula = async (cedula) => {
    if (!cedula || cedula.length < 5) return null;

    try {
        // We use a public proxy for demonstration, but for production 
        // a custom backend proxy is recommended to avoid CORS and rate limits.
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const targetUrl = encodeURIComponent(`https://www.adres.gov.co/consulte-su-eps?IdDocumento=${cedula}&TipoDocumento=CC`);
        
        const response = await fetch(`${proxyUrl}${targetUrl}`);
        const data = await response.json();
        
        if (!data.contents) throw new Error('No content returned from ADRES');

        // Parse the HTML to find the name
        // Usually names are in a table or specific span.
        // ADRES structure often includes strings like "Nombres y Apellidos"
        const html = data.contents;
        
        // Simple regex to find the name in the HTML
        // This is a naive implementation; real scraping needs more robust selectors.
        const nameMatch = html.match(/nombre[^>]*>([^<]+)/i) || 
                          html.match(/Apellidos y Nombres[^>]*>([^<]+)/i) ||
                          html.match(/class="[^"]*nombre[^"]*"[^>]*>([^<]+)/i);

        if (nameMatch && nameMatch[1]) {
            return nameMatch[1].trim();
        }

        // Alternative: ADRES BDUA sometimes has a different structure
        const tableMatch = html.match(/<td[^>]*>(.*?)<\/td>/g);
        if (tableMatch) {
            // Usually the name is in one of the first few cells after some headers
            // This is fragile but works in some versions of the page
            const cleanTable = tableMatch.map(td => td.replace(/<[^>]*>/g, '').trim());
            const nameIndex = cleanTable.findIndex(text => text.includes('Nombres') || text.includes('Apellidos'));
            if (nameIndex !== -1 && cleanTable[nameIndex + 1]) {
                return cleanTable[nameIndex + 1];
            }
        }

        return null;
    } catch (error) {
        console.error('Error looking up ID in ADRES:', error);
        return null;
    }
};

/**
 * Validates if the ID format is correct (numeric)
 */
export const isValidCedula = (cedula) => {
    return /^\d+$/.test(cedula) && cedula.length >= 6;
};
