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
    // IMPORTANTE: Responder inmediatamente a WhatsApp
    res.sendStatus(200);
    
    try {
        const body = req.body;
        
        // Verificar la estructura del mensaje
        if (!body.entry?.[0]?.changes?.[0]?.value) {
            return;
        }
        
        const value = body.entry[0].changes[0].value;
        
        // Procesar mensajes
        if (value.messages && value.messages[0]) {
            const message = value.messages[0];
            const from = message.from;
            const messageId = message.id;
            
            console.log(`\n💬 Nuevo mensaje de ${from}`);
            
            // Solo procesar mensajes de texto por ahora
            if (message.type === 'text' && message.text) {
                const text = message.text.body;
                console.log(`Texto: "${text}"`);
                
                // Marcar como leído
                await whatsappService.markAsRead(messageId);
                
                // Esperar un poco antes de responder (más natural)
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Enviar respuesta simple
                let responseText = '';
                
                if (text.toLowerCase().includes('hola')) {
                    responseText = '¡Hola! 👋 Bienvenido a nuestro servicio de WhatsApp.\n\nEscribe "menu" para ver las opciones disponibles.';
                } else if (text.toLowerCase() === 'menu') {
                    responseText = '📋 *MENÚ PRINCIPAL*\n\n1️⃣ Información\n2️⃣ Precios\n3️⃣ Contacto\n\nResponde con el número de tu elección.';
                } else if (text === '1') {
                    responseText = 'ℹ️ *INFORMACIÓN*\n\nSomos una empresa dedicada a brindar los mejores servicios.\n\n¿Necesitas algo más? Escribe "menu"';
                } else if (text === '2') {
                    responseText = '💰 *PRECIOS*\n\n• Plan Básico: $10/mes\n• Plan Pro: $25/mes\n• Plan Enterprise: Contactar\n\nEscribe "menu" para más opciones.';
                } else if (text === '3') {
                    responseText = '📞 *CONTACTO*\n\n📧 Email: info@empresa.com\n📱 WhatsApp: Este mismo número\n🌐 Web: www.empresa.com\n\nEscribe "menu" para volver.';
                } else {
                    responseText = 'No entendí tu mensaje 😅\n\nEscribe "menu" para ver las opciones disponibles.';
                }
                
                // Enviar respuesta
                await whatsappService.sendTextMessage(from, responseText);
            }
        }
        
        // Procesar estados de mensajes
        if (value.statuses && value.statuses[0]) {
            const status = value.statuses[0];
            console.log(`📊 Estado: ${status.status} para ${status.recipient_id}`);
        }
        
    } catch (error) {
        console.error('❌ Error en webhook:', error.message);
    }
};

module.exports = {
    verifyWebhook,
    handleWebhook
};