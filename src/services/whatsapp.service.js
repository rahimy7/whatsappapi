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
            console.error('Status:', error.response?.status);
            console.error('Status Text:', error.response?.statusText);
            console.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
            console.error('Error Message:', error.message);
            
            // Log más detalles del error
            if (error.response?.data?.error) {
                const err = error.response.data.error;
                console.error('Error details:');
                console.error('- Code:', err.error_subcode || err.code);
                console.error('- Message:', err.message);
                console.error('- Type:', err.type);
                console.error('- FB Trace ID:', err.fbtrace_id);
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