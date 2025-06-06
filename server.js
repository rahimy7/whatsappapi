// server.js
require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor WhatsApp Bot corriendo en puerto ${PORT}`);
    console.log(`📱 Webhook URL: http://localhost:${PORT}/webhook`);
});