const axios = require('axios');

class WhatsAppService {
    constructor() {
        this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '667993026397854';
        this.token = process.env.WHATSAPP_TOKEN;
        this.apiVersion = 'v18.0';
        this.baseUrl = 'https://graph.facebook.com';
        
        console.log('WhatsApp Service inicializado:');
        console.log('- Phone Number ID:', this.phoneNumberId);
        console.log('- Token configurado:', this.token ? 'Sí' : 'No');
        console.log('- Token length:', this.token?.length);
        
        // Configurar axios con timeout y retry
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            timeout: 30000, // 30 segundos
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        });
    }

    // Enviar mensaje de texto simple
    async sendTextMessage(to, message) {
        console.log(`\n📤 Intentando enviar mensaje a ${to}`);
        console.log(`Mensaje: "${message.substring(0, 50)}..."`);
        
        const url = `/${this.apiVersion}/${this.phoneNumberId}/messages`;
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
        
        try {
            console.log('Enviando petición a WhatsApp API...');
            const response = await this.axiosInstance.post(url, data);
            
            console.log('✅ Mensaje enviado exitosamente');
            console.log('Message ID:', response.data.messages?.[0]?.id);
            
            console.log('📬 Respuesta de WhatsApp API:', JSON.stringify(response.data, null, 2));
            return response.data;
            
        } catch (error) {
            console.error('\n❌ Error enviando mensaje');
            
            if (error.response) {
                // Error de la API
                console.error('Status:', error.response.status);
                console.error('Error:', JSON.stringify(error.response.data, null, 2));
                
                if (error.response.status === 401) {
                    console.error('\n🔴 ERROR DE AUTENTICACIÓN (401)');
                    console.error('El token es inválido o ha expirado.');
                    console.error('Solución: Genera un nuevo token en Meta y actualiza WHATSAPP_TOKEN en Vercel');
                } else if (error.response.status === 403) {
                    console.error('\n🔴 ERROR DE PERMISOS (403)');
                    console.error('No tienes permisos para enviar mensajes.');
                } else if (error.response.status === 404) {
                    console.error('\n🔴 ERROR 404');
                    console.error('Verifica que el Phone Number ID sea correcto:', this.phoneNumberId);
                }
                
            } else if (error.code === 'ECONNABORTED') {
                console.error('⏱️ Timeout - La petición tardó demasiado');
            } else if (error.code === 'EPROTO' || error.code === 'ECONNRESET') {
                console.error('🔌 Error de conexión SSL/TLS');
                console.error('Esto puede ser un problema temporal con los servidores de Meta');
            } else {
                console.error('Error desconocido:', error.message);
                console.error('Código:', error.code);
            }
            
            // No lanzar el error para que el webhook no falle
            
                console.error('🧨 Error completo:', error.toJSON?.() || error);
            return null;
        }
    }

    // Enviar mensaje con botones
    async sendButtonMessage(to, bodyText, buttons) {
        console.log(`\n📤 Intentando enviar botones a ${to}`);
        
        const url = `/${this.apiVersion}/${this.phoneNumberId}/messages`;
        const data = {
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
                    buttons: buttons.slice(0, 3).map((button, index) => ({
                        type: 'reply',
                        reply: {
                            id: button.id || `button_${index}`,
                            title: button.title.substring(0, 20) // Máximo 20 caracteres
                        }
                    }))
                }
            }
        };
        
        try {
            const response = await this.axiosInstance.post(url, data);
            console.log('✅ Botones enviados exitosamente');
            
            console.log('📬 Respuesta de WhatsApp API:', JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            console.error('❌ Error enviando botones:', error.response?.data || error.message);
            
                console.error('🧨 Error completo:', error.toJSON?.() || error);
            return null;
        }
    }

    // Marcar mensaje como leído
    async markAsRead(messageId) {
        if (!messageId) return;
        
        const url = `/${this.apiVersion}/${this.phoneNumberId}/messages`;
        const data = {
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: messageId
        };
        
        try {
            await this.axiosInstance.post(url, data);
            console.log('👁️ Mensaje marcado como leído');
        } catch (error) {
            console.error('Error marcando como leído:', error.message);
        }
    }
}

module.exports = new WhatsAppService();