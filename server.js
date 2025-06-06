require('dotenv').config();
const app = require('./src/app');

// Usa SOLO el puerto que proporciona Railway (no pongas valor por defecto)
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`🚀 Servidor WhatsApp Bot corriendo en puerto ${PORT}`);
    console.log(`📱 Webhook URL: https://whatsappapi-production-90d5.up.railway.app/webhook`);
});
