const axios = require('axios');
const config = require('../config/whatsapp.config');
const FormData = require('form-data');
const fs = require('fs');

class WhatsAppService {
    constructor() {
        this.apiUrl = `${config.api.baseUrl}/${config.api.version}/${config.api.phoneNumberId}`;
        this.token = config.api.token;
    }

    // Enviar mensaje de texto simple
    async sendTextMessage(to, message) {
        try {
            const response = await axios.post(
                `${this.apiUrl}/messages`,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: to,
                    type: 'text',
                    text: {
                        preview_url: false,
                        body: message
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('✅ Mensaje enviado:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error enviando mensaje:', error.response?.data || error.message);
            throw error;
        }
    }

    // Enviar imagen
    async sendImageMessage(to, imageUrl, caption = '') {
        try {
            const response = await axios.post(
                `${this.apiUrl}/messages`,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: to,
                    type: 'image',
                    image: {
                        link: imageUrl,
                        caption: caption
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return response.data;
        } catch (error) {
            console.error('❌ Error enviando imagen:', error.response?.data || error.message);
            throw error;
        }
    }

    // Enviar mensaje con botones
    async sendButtonMessage(to, bodyText, buttons) {
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
            
            return response.data;
        } catch (error) {
            console.error('❌ Error enviando botones:', error.response?.data || error.message);
            throw error;
        }
    }

    // Enviar lista de opciones
    async sendListMessage(to, headerText, bodyText, footerText, buttonText, sections) {
        try {
            const response = await axios.post(
                `${this.apiUrl}/messages`,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: to,
                    type: 'interactive',
                    interactive: {
                        type: 'list',
                        header: {
                            type: 'text',
                            text: headerText
                        },
                        body: {
                            text: bodyText
                        },
                        footer: {
                            text: footerText
                        },
                        action: {
                            button: buttonText,
                            sections: sections
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
            
            return response.data;
        } catch (error) {
            console.error('❌ Error enviando lista:', error.response?.data || error.message);
            throw error;
        }
    }

    // Marcar mensaje como leído
    async markAsRead(messageId) {
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
            
            return response.data;
        } catch (error) {
            console.error('❌ Error marcando como leído:', error.response?.data || error.message);
        }
    }

    // Subir media (imagen, documento, etc.)
    async uploadMedia(filePath, mimeType) {
        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath));
            formData.append('messaging_product', 'whatsapp');
            formData.append('type', mimeType);

            const response = await axios.post(
                `${this.apiUrl}/media`,
                formData,
                {
                    headers: {
                        ...formData.getHeaders(),
                        'Authorization': `Bearer ${this.token}`
                    }
                }
            );

            return response.data.id;
        } catch (error) {
            console.error('❌ Error subiendo media:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new WhatsAppService();