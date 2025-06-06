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
    
    // IMPORTANTE: Responder inmediatamente a WhatsApp
    res.sendStatus(200);
    
    try {
        const body = req.body;
        console.log('Body completo:', JSON.stringify(body, null, 2));
        
        if (!body.entry || !body.entry[0]) {
            console.log('No hay datos de entrada');
            return;
        }
        
        const entry = body.entry[0];
        const changes = entry.changes;
        
        if (!changes || !changes[0]) {
            console.log('No hay cambios en la entrada');
            return;
        }
        
        const change = changes[0];
        const value = change.value;
        
        if (!value) {
            console.log('No hay valor en el cambio');
            return;
        }
        
        // Verificar si es un mensaje
        if (value.messages && value.messages[0]) {
            const message = value.messages[0];
            const from = message.from;
            const messageId = message.id;
            const messageType = message.type;
            
            console.log(`\n💬 Nuevo mensaje:`);
            console.log(`- De: ${from}`);
            console.log(`- Tipo: ${messageType}`);
            console.log(`- ID: ${messageId}`);
            
            // Procesar mensaje de texto
            if (messageType === 'text' && message.text) {
                const text = message.text.body;
                console.log(`- Texto: "${text}"`);
                
                // Determinar respuesta
                let responseText = '';
                
                if (text.toLowerCase().includes('hola')) {
                    responseText = '¡Hola! 👋 Bienvenido a nuestro bot de WhatsApp. ¿En qué puedo ayudarte hoy?\n\nEscribe *menu* para ver las opciones disponibles.';
                } else if (text.toLowerCase() === 'menu') {
                    responseText = '📋 *MENÚ PRINCIPAL*\n\n' +
                                 '1️⃣ Ver productos\n' +
                                 '2️⃣ Hacer pedido\n' +
                                 '3️⃣ Consultar estado\n' +
                                 '4️⃣ Soporte\n\n' +
                                 'Escribe el número de la opción que desees.';
                } else if (text === '1') {
                    responseText = '🛍️ *NUESTROS PRODUCTOS*\n\n' +
                                 '• Producto A - $10\n' +
                                 '• Producto B - $20\n' +
                                 '• Producto C - $30\n\n' +
                                 'Para ordenar, escribe el nombre del producto.';
                } else {
                    responseText = `Recibí tu mensaje: "${text}"\n\nEscribe *menu* para ver las opciones disponibles.`;
                }
                
                // Enviar respuesta
                try {
                    await whatsappService.sendTextMessage(from, responseText);
                    console.log('✅ Respuesta enviada');
                } catch (error) {
                    console.error('❌ Error enviando respuesta:', error.message);
                }
            }
        }
        
        // Verificar si es un estado de mensaje
        if (value.statuses && value.statuses[0]) {
            const status = value.statuses[0];
            console.log(`📊 Estado: ${status.status} para ${status.recipient_id}`);
        }
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
};

module.exports = {
    verifyWebhook,
    handleWebhook
};