const express = require('express');
const bodyParser = require('body-parser');
const webhookController = require('./controllers/webhook.controller');

const app = express();

// Middleware para saltar la advertencia de ngrok
app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'WhatsApp Bot Backend está funcionando' 
    });
});

// Webhook endpoints
app.get('/webhook', webhookController.verifyWebhook);
app.post('/webhook', webhookController.handleWebhook);

// Test endpoint
app.get('/webhook/test', webhookController.testEndpoint);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Algo salió mal!',
        message: err.message 
    });
});

module.exports = app;