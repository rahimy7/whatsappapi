require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

// Solo iniciar el servidor si no estamos en Vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor WhatsApp Bot corriendo en puerto ${PORT}`);
        console.log(`📱 Webhook URL: http://localhost:${PORT}/webhook`);
    });
}

// Exportar para Vercel
module.exports = app;