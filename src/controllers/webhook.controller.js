const whatsappService = require('../services/whatsapp.service');
const messageService = require('../services/message.service');

// Verificar el webhook (GET)
const verifyWebhook = (req, res) => {
    console.log('🔔 GET /webhook - Verificación');

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        console.log('✅ Webhook verificado');
        res.status(200).send(challenge);
    } else {
        console.log('❌ Verificación fallida');
        res.sendStatus(403);
    }
};

// Manejar mensajes entrantes (POST)
const handleWebhook = async (req, res) => {
    res.sendStatus(200); // responder inmediatamente a Meta

    try {
        const body = req.body;

        const value = body.entry?.[0]?.changes?.[0]?.value;
        if (!value) return;

        // Procesar mensajes
        if (value.messages && value.messages[0]) {
            const message = value.messages[0];
            const from = message.from;

            console.log(`\n💬 Nuevo mensaje de ${from}`);

            await messageService.processMessage({
                from,
                messageBody: message.text?.body || '',
                messageType: message.type,
                message: message
            });
        }

        // Procesar estados (opcional)
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
