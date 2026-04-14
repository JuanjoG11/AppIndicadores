const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    }).on('error', reject);
  });
}

(async () => {
    try {
        console.log("Testing ADRES basic...");
        const res = await get('https://www.adres.gov.co/consulte-su-eps');
        console.log("Status:", res.statusCode);
        console.log("Data length:", res.data.length);
    } catch(e) {
        console.error("Error:", e);
    }
})();
