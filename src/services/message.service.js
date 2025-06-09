const whatsappService = require('./whatsapp.service');
const messageTemplates = require('../utils/messageTemplates');

class MessageService {
    constructor() {
        // Estado de conversaciones por usuario
        this.userStates = new Map();
    }

    async processMessage({ from, messageBody, messageType, message }) {        console.log('[📥 PROCESS] Mensaje recibido:', { from, messageType, messageBody });

        try {
            // Marcar mensaje como leído
            if (message.id) {
                await whatsappService.markAsRead(message.id);
            }

            // Obtener o inicializar estado del usuario
            const userState = this.getUserState(from);

            // Procesar según el tipo de mensaje
            if (messageType === 'text') {
                await this.handleTextMessage(from, messageBody, userState);
            } else if (messageType === 'interactive') {
                await this.handleInteractiveMessage(from, message, userState);
            } else {
                // Para otros tipos de mensajes (imagen, audio, etc.)
                await whatsappService.sendTextMessage(
                    from,
                    '📎 Recibí tu archivo. Por ahora solo puedo procesar mensajes de texto. ¿En qué puedo ayudarte?'
                );
            }

        } catch (error) {
            console.error('Error procesando mensaje:', error);
            await this.sendErrorMessage(from);
        }
    }

    async handleTextMessage(from, messageBody, userState) {
        const lowerMessage = messageBody.toLowerCase().trim();

        // Comandos principales
        if (lowerMessage === 'hola' || lowerMessage === 'inicio' || lowerMessage === 'menu') {
            await this.sendWelcomeMessage(from);
            this.updateUserState(from, { stage: 'menu' });
        } 
        else if (lowerMessage === 'ayuda' || lowerMessage === 'help') {
            await this.sendHelpMessage(from);
        }
        else if (userState.stage === 'awaiting_name') {
            // Guardar nombre y continuar
            this.updateUserState(from, { 
                name: messageBody,
                stage: 'menu' 
            });
            await this.sendPersonalizedMenu(from, messageBody);
        }
        else {
            // Mensaje no reconocido
            await this.sendDefaultMessage(from);
        }
    }

    async handleInteractiveMessage(from, message, userState) {
        const buttonReply = message.interactive?.button_reply;
        const listReply = message.interactive?.list_reply;

        if (buttonReply) {
            const buttonId = buttonReply.id;
            
            switch (buttonId) {
                case 'btn_products':
                    await this.sendProductsMenu(from);
                    break;
                case 'btn_support':
                    await this.sendSupportInfo(from);
                    break;
                case 'btn_location':
                    await this.sendLocationInfo(from);
                    break;
                default:
                    await this.sendDefaultMessage(from);
            }
        }

        if (listReply) {
            const selectedId = listReply.id;
            await this.handleListSelection(from, selectedId);
        }
    }

    // Mensajes predefinidos
    async sendWelcomeMessage(from) {
        const welcomeText = messageTemplates.welcome;
        
        // Enviar mensaje de bienvenida
        await whatsappService.sendTextMessage(from, welcomeText);
        
        // Esperar un momento y enviar el menú principal
        setTimeout(async () => {
            await this.sendMainMenu(from);
        }, 1500);
    }

    async sendMainMenu(from) {
        const buttons = [
            { id: 'btn_products', title: '🛍️ Ver Productos' },
            { id: 'btn_support', title: '💬 Soporte' },
            { id: 'btn_location', title: '📍 Ubicación' }
        ];

        await whatsappService.sendButtonMessage(
            from,
            '¿Qué te gustaría hacer hoy?',
            buttons
        );
    }

    async sendProductsMenu(from) {
        const sections = [
            {
                title: 'Categorías',
                rows: [
                    {
                        id: 'cat_electronics',
                        title: '📱 Electrónicos',
                        description: 'Smartphones, laptops y más'
                    },
                    {
                        id: 'cat_clothing',
                        title: '👕 Ropa',
                        description: 'Moda para toda la familia'
                    },
                    {
                        id: 'cat_home',
                        title: '🏠 Hogar',
                        description: 'Todo para tu casa'
                    },
                    {
                        id: 'cat_sports',
                        title: '⚽ Deportes',
                        description: 'Equipamiento deportivo'
                    }
                ]
            }
        ];

        await whatsappService.sendListMessage(
            from,
            '🛍️ Nuestros Productos',
            'Explora nuestras categorías y encuentra lo que buscas',
            'Precios especiales esta semana',
            'Ver Categorías',
            sections
        );
    }

    async sendSupportInfo(from) {
        const supportText = `💬 *Soporte al Cliente*

📞 Teléfono: +1234567890
📧 Email: soporte@tuempresa.com
⏰ Horario: Lun-Vie 9AM-6PM

¿Tienes alguna pregunta específica? Escríbela y te ayudaremos.`;

        await whatsappService.sendTextMessage(from, supportText);
    }

    async sendLocationInfo(from) {
        const locationText = `📍 *Nuestra Ubicación*

🏢 Calle Principal 123
🌆 Ciudad, País
📮 CP: 12345

🗺️ Ver en Google Maps: https://maps.google.com

¿Te gustaría agendar una visita?`;

        await whatsappService.sendTextMessage(from, locationText);
        
        // Opcionalmente, enviar ubicación real
        // await whatsappService.sendLocation(from, latitude, longitude, name, address);
    }

    async sendHelpMessage(from) {
        const helpText = messageTemplates.help;
        await whatsappService.sendTextMessage(from, helpText);
    }

    async sendDefaultMessage(from) {
        const defaultText = `No entendí tu mensaje 😅

Puedes escribir:
• *menu* - Ver opciones principales
• *ayuda* - Ver comandos disponibles
• *hola* - Comenzar de nuevo`;

        await whatsappService.sendTextMessage(from, defaultText);
    }

    async sendErrorMessage(from) {
        await whatsappService.sendTextMessage(
            from,
            '❌ Lo siento, ocurrió un error. Por favor intenta de nuevo más tarde.'
        );
    }

    async sendPersonalizedMenu(from, name) {
        await whatsappService.sendTextMessage(
            from,
            `¡Mucho gusto ${name}! 🎉\n\nAhora sí, veamos cómo puedo ayudarte:`
        );
        
        setTimeout(async () => {
            await this.sendMainMenu(from);
        }, 1000);
    }

    async handleListSelection(from, selectedId) {
        // Manejar selecciones de lista
        switch (selectedId) {
            case 'cat_electronics':
                await this.sendCategoryProducts(from, 'Electrónicos', [
                    '📱 iPhone 15 Pro - $999',
                    '💻 MacBook Air M2 - $1299',
                    '🎧 AirPods Pro - $249',
                    '⌚ Apple Watch Series 9 - $399'
                ]);
                break;
            case 'cat_clothing':
                await this.sendCategoryProducts(from, 'Ropa', [
                    '👔 Camisa formal - $45',
                    '👖 Jeans premium - $80',
                    '👗 Vestido elegante - $120',
                    '👟 Zapatillas deportivas - $95'
                ]);
                break;
            default:
                await this.sendDefaultMessage(from);
        }
    }

    async sendCategoryProducts(from, category, products) {
        let productList = `🛍️ *Productos en ${category}*\n\n`;
        products.forEach((product, index) => {
            productList += `${index + 1}. ${product}\n`;
        });
        productList += '\n💳 *Envía el número del producto que te interesa*';

        await whatsappService.sendTextMessage(from, productList);
    }

    // Gestión de estado de usuario
    getUserState(userId) {
        if (!this.userStates.has(userId)) {
            this.userStates.set(userId, {
                stage: 'initial',
                data: {}
            });
        }
        return this.userStates.get(userId);
    }

    updateUserState(userId, updates) {
        const currentState = this.getUserState(userId);
        this.userStates.set(userId, {
            ...currentState,
            ...updates
        });
    }
}

module.exports = new MessageService();