const whatsappService = require('../services/whatsapp.service');

// Verificar el webhook (GET)
const verifyWebhook = (req, res) => {
    console.log('🔔 GET /webhook - Verificación');
    
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    if (mode === 'subscribe' && token === 'whatsapp-order-token') {
        console.log('✅ Webhook verificado');
        res.status(200).send(challenge);
    } else {
        console.log('❌ Verificación fallida');
        res.sendStatus(403);
    }
};

// Manejar mensajes entrantes (POST)
const handleWebhook = async (req, res) => {
    console.log('\n📨 POST /webhook - Mensaje recibido');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    // IMPORTANTE: Responder inmediatamente a WhatsApp
    res.sendStatus(200);
    
    try {
        const { entry } = req.body;
        
        if (!entry || !entry[0] || !entry[0].changes || !entry[0].changes[0]) {
            console.log('❌ Estructura de mensaje no válida');
            return;
        }
        
        const change = entry[0].changes[0];
        const value = change.value;
        
        // Verificar si es un mensaje
        if (value.messages && value.messages[0]) {
            const message = value.messages[0];
            const from = message.from;
            const messageId = message.id;
            const messageType = message.type;
            
            console.log(`\n💬 Procesando mensaje:`);
            console.log(`- De: ${from}`);
            console.log(`- Tipo: ${messageType}`);
            console.log(`- ID: ${messageId}`);
            
            // Marcar como leído
            await whatsappService.markAsRead(messageId);
            
            // Procesar según el tipo de mensaje
            if (messageType === 'text') {
                const text = message.text.body;
                console.log(`- Texto: "${text}"`);
                
                // Responder al mensaje
                let responseText = '';
                
                if (text.toLowerCase().includes('hola')) {
                    responseText = '¡Hola! 👋 Bienvenido a nuestro servicio de WhatsApp. ¿En qué puedo ayudarte?';
                } else if (text.toLowerCase().includes('menu')) {
                    responseText = '📋 *MENÚ PRINCIPAL*\n\n1️⃣ Ver productos\n2️⃣ Hacer pedido\n3️⃣ Consultar estado\n4️⃣ Soporte\n\nEscribe el número de la opción que desees.';
                } else {
                    responseText = `Recibí tu mensaje: "${text}"\n\nEscribe "menu" para ver las opciones disponibles.`;
                }
                
                // Enviar respuesta
                await whatsappService.sendTextMessage(from, responseText);
                
            } else if (messageType === 'image') {
                console.log('- Es una imagen');
                await whatsappService.sendTextMessage(from, '📷 Recibí tu imagen. Por el momento solo puedo procesar mensajes de texto.');
                
            } else {
                console.log(`- Tipo de mensaje no soportado: ${messageType}`);
                await whatsappService.sendTextMessage(from, 'Por el momento solo puedo procesar mensajes de texto. Escribe "menu" para ver las opciones.');
            }
            
        } else if (value.statuses && value.statuses[0]) {
            // Es una actualización de estado
            const status = value.statuses[0];
            console.log(`📊 Estado actualizado: ${status.status} para mensaje ${status.id}`);
        }
        
    } catch (error) {
        console.error('❌ Error procesando webhook:', error);
    }
};

module.exports = {
    verifyWebhook,
    handleWebhook
};