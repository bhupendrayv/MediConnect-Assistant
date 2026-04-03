const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

try {
    const pems = selfsigned.generate([{ name: 'commonName', value: 'localhost' }], { days: 365 });
    
    const certDir = path.join(__dirname, 'certs');
    if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir);
    }
    
    fs.writeFileSync(path.join(certDir, 'key.pem'), pems.private);
    fs.writeFileSync(path.join(certDir, 'cert.pem'), pems.cert);
    
    console.log('SUCCESS: Self-signed certificates generated in ./certs/');
} catch (err) {
    console.error('ERROR during cert generation:', err);
    process.exit(1);
}
