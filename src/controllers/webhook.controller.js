// Temporalmente hardcodear el token para debugging
const VERIFY_TOKEN = 'whatsapp-order-token';

// Verificar el webhook (GET)
const verifyWebhook = (req, res) => {
    console.log('\n========== VERIFICACIÓN DE WEBHOOK ==========');
    console.log('Timestamp:', new Date().toISOString());
    console.log('URL completa:', req.url);
    console.log('Método:', req.method);
    console.log('Headers:', req.headers);
    console.log('Query params:', req.query);
    
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    console.log('\nValores recibidos:');
    console.log('- hub.mode:', mode);
    console.log('- hub.verify_token:', token);
    console.log('- hub.challenge:', challenge);
    console.log('\nValor esperado del token:', VERIFY_TOKEN);
    console.log('¿Tokens coinciden?:', token === VERIFY_TOKEN);
    console.log('===========================================\n');

    // Verificación principal
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ ÉXITO: Webhook verificado correctamente');
        console.log('Enviando challenge:', challenge);
        res.status(200).send(challenge);
    } else {
        console.error('❌ ERROR: Verificación fallida');
        if (mode !== 'subscribe') {
            console.error('- El modo no es "subscribe", es:', mode);
        }
        if (token !== VERIFY_TOKEN) {
            console.error('- El token no coincide');
            console.error('  Token recibido:', token);
            console.error('  Token esperado:', VERIFY_TOKEN);
        }
        res.sendStatus(403);
    }
};

// Manejar mensajes entrantes (POST)
const handleWebhook = async (req, res) => {
    console.log('\n========== WEBHOOK POST RECIBIDO ==========');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Headers:', req.headers);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('==========================================\n');
    
    try {
        const body = req.body;

        // Siempre responder 200 OK a WhatsApp inmediatamente
        res.sendStatus(200);

        // Luego procesar el mensaje
        if (body.object === 'whatsapp_business_account') {
            if (body.entry && 
                body.entry[0] && 
                body.entry[0].changes && 
                body.entry[0].changes[0] && 
                body.entry[0].changes[0].value) {
                
                const value = body.entry[0].changes[0].value;

                // Procesar mensajes
                if (value.messages && value.messages[0]) {
                    const message = value.messages[0];
                    console.log('📨 Nuevo mensaje:');
                    console.log('- De:', message.from);
                    console.log('- Tipo:', message.type);
                    console.log('- Contenido:', message.text?.body || '[No es texto]');
                    
                    // Aquí procesarías el mensaje
                    // Por ahora solo log
                }

                // Procesar estados
                if (value.statuses && value.statuses[0]) {
                    const status = value.statuses[0];
                    console.log('📊 Estado de mensaje:');
                    console.log('- Estado:', status.status);
                    console.log('- Para:', status.recipient_id);
                }
            }
        }
    } catch (error) {
        console.error('❌ Error procesando webhook:', error);
    }
};

// Endpoint de prueba
const testEndpoint = (req, res) => {
    console.log('Test endpoint alcanzado');
    res.json({
        status: 'ok',
        message: 'Webhook controller funcionando',
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    verifyWebhook,
    handleWebhook,
    testEndpoint
};