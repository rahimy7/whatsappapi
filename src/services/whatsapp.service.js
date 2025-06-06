const axios = require('axios');

class WhatsAppService {
    constructor() {
        // Valores hardcodeados temporalmente para debugging
        this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '667993026397854';
        this.token = process.env.WHATSAPP_TOKEN || 'TU_TOKEN_AQUI';
        this.apiVersion = 'v18.0';
        this.apiUrl = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}`;
        
        console.log('WhatsApp Service inicializado:');
        console.log('- Phone Number ID:', this.phoneNumberId);
        console.log('- API URL:', this.apiUrl);
        console.log('- Token configurado:', this.token ? 'Sí' : 'No');
        console.log('- Token length:', this.token?.length);
    }

    // Enviar mensaje de texto simple
    async sendTextMessage(to, message) {
        console.log(`\n📤 Intentando enviar mensaje a ${to}: "${message}"`);
        
        const url = `${this.apiUrl}/messages`;
        const data = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to,
            type: 'text',
            text: {
                preview_url: false,
                body: message
            }
        };
        
        console.log('URL:', url);
        console.log('Data:', JSON.stringify(data, null, 2));
        console.log('Token (primeros 20 chars):', this.token.substring(0, 20) + '...');
        
        try {
            const response = await axios.post(url, data, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Mensaje enviado exitosamente:');
            console.log('Response:', JSON.stringify(response.data, null, 2));
            return response.data;
            
        } catch (error) {
            console.error('❌ Error enviando mensaje:');
            
            if (error.response) {
                // La petición se hizo y el servidor respondió con un código de error
                console.error('Status:', error.response.status);
                console.error('Status Text:', error.response.statusText);
                console.error('Headers:', error.response.headers);
                console.error('Data:', JSON.stringify(error.response.data, null, 2));
                
                if (error.response.data?.error) {
                    const err = error.response.data.error;
                    console.error('\n🔴 Detalles del error de WhatsApp:');
                    console.error('- Código:', err.code);
                    console.error('- Subcódigo:', err.error_subcode);
                    console.error('- Mensaje:', err.message);
                    console.error('- Tipo:', err.type);
                    console.error('- Trace ID:', err.fbtrace_id);
                    
                    // Errores comunes
                    if (err.code === 190 || error.response.status === 401) {
                        console.error('\n⚠️ ERROR DE AUTENTICACIÓN:');
                        console.error('1. El token ha expirado (los temporales duran 24h)');
                        console.error('2. El token está mal copiado');
                        console.error('3. Necesitas generar un nuevo token en Meta');
                        console.error('\nSOLUCIÓN:');
                        console.error('- Ve a developers.facebook.com');
                        console.error('- Tu App > WhatsApp > API Setup');
                        console.error('- Genera un nuevo token temporal');
                        console.error('- Actualiza WHATSAPP_TOKEN en Vercel');
                    } else if (err.code === 100) {
                        console.error('⚠️ Parámetros inválidos en la petición');
                    } else if (err.error_subcode === 2018001) {
                        console.error('⚠️ El número no está registrado en WhatsApp');
                    }
                }
            } else if (error.request) {
                // La petición se hizo pero no se recibió respuesta
                console.error('❌ No se recibió respuesta de la API');
                console.error('Request:', error.request);
            } else {
                // Algo más pasó
                console.error('❌ Error configurando la petición:', error.message);
            }
            
            throw error;
        }
    }

    // Enviar mensaje con botones
    async sendButtonMessage(to, bodyText, buttons) {
        console.log(`\n📤 Intentando enviar botones a ${to}`);
        
        try {
            const response = await axios.post(
                `${this.apiUrl}/messages`,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: to,
                    type: 'interactive',
                    interactive: {
                        type: 'button',
                        body: {
                            text: bodyText
                        },
                        action: {
                            buttons: buttons.map((button, index) => ({
                                type: 'reply',
                                reply: {
                                    id: button.id || `button_${index}`,
                                    title: button.title
                                }
                            }))
                        }
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('✅ Botones enviados exitosamente');
            return response.data;
        } catch (error) {
            console.error('❌ Error enviando botones:', error.response?.data || error.message);
            throw error;
        }
    }

    // Marcar mensaje como leído
    async markAsRead(messageId) {
        if (!messageId) {
            console.log('No hay messageId para marcar como leído');
            return;
        }
        
        console.log(`\n👁️ Marcando mensaje ${messageId} como leído`);
        
        try {
            const response = await axios.post(
                `${this.apiUrl}/messages`,
                {
                    messaging_product: 'whatsapp',
                    status: 'read',
                    message_id: messageId
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('✅ Marcado como leído');
            return response.data;
        } catch (error) {
            console.error('❌ Error marcando como leído:', error.response?.data || error.message);
            // No lanzar error aquí, solo log
        }
    }
}

module.exports = new WhatsAppService();