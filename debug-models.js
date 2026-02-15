const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env.local to get the API key
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : null;

if (!apiKey) {
    console.error("Could not find GEMINI_API_KEY in .env.local");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

// ... (existing code)

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            if (response.error) {
                fs.writeFileSync('models_error.txt', JSON.stringify(response.error, null, 2));
            } else {
                const modelNames = response.models ? response.models.map(m => m.name) : [];
                fs.writeFileSync('models.txt', modelNames.join('\n'));
            }
        } catch (e) {
            fs.writeFileSync('models_error.txt', String(e) + '\n' + data);
        }
    });
}).on('error', (err) => {
    fs.writeFileSync('models_error.txt', String(err));
});
