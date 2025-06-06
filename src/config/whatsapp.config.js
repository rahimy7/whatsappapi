module.exports = {
    // WhatsApp API Configuration
    api: {
        version: 'v18.0',
        baseUrl: 'https://graph.facebook.com',
        token: process.env.WHATSAPP_TOKEN,
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
        businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
    },
    
    // Webhook Configuration
    webhook: {
        verifyToken: process.env.WHATSAPP_VERIFY_TOKEN
    },
    
    // Message Templates
    messageTypes: {
        TEXT: 'text',
        IMAGE: 'image',
        DOCUMENT: 'document',
        AUDIO: 'audio',
        VIDEO: 'video',
        LOCATION: 'location',
        INTERACTIVE: 'interactive',
        TEMPLATE: 'template'
    },
    
    // Interactive Message Types
    interactiveTypes: {
        LIST: 'list',
        BUTTON: 'button',
        PRODUCT: 'product',
        PRODUCT_LIST: 'product_list'
    }
};