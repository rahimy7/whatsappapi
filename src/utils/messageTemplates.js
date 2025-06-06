module.exports = {
    welcome: `¡Hola! 👋 Bienvenido a *TuEmpresa Bot*

Soy tu asistente virtual y estoy aquí para ayudarte 24/7 🤖

✨ Puedo ayudarte con:
• Ver nuestros productos
• Resolver dudas
• Información de contacto
• Y mucho más...

¿Cómo te llamas? 😊`,

    help: `📋 *Comandos Disponibles*

Puedes usar estos comandos en cualquier momento:

• *hola* o *inicio* - Volver al menú principal
• *menu* - Ver opciones disponibles  
• *ayuda* - Ver esta lista de comandos
• *productos* - Ver catálogo
• *soporte* - Contactar soporte
• *ubicacion* - Ver nuestra dirección

También puedes escribirme libremente y trataré de ayudarte 💬`,

    farewell: `¡Gracias por contactarnos! 👋

Si necesitas algo más, no dudes en escribirnos.

¡Que tengas un excelente día! 🌟`,

    businessHours: `⏰ *Horario de Atención*

Lunes a Viernes: 9:00 AM - 6:00 PM
Sábados: 9:00 AM - 2:00 PM
Domingos: Cerrado

Fuera de horario, déjanos tu mensaje y te responderemos lo antes posible 📩`,

    orderConfirmation: (orderDetails) => `✅ *Pedido Confirmado*

N° de Orden: ${orderDetails.orderNumber}
Total: ${orderDetails.total}

${orderDetails.items}

📦 Tiempo de entrega estimado: ${orderDetails.deliveryTime}

¡Gracias por tu compra! 🛍️`,

    productInfo: (product) => `📦 *${product.name}*

${product.description}

💰 Precio: ${product.price}
📊 Stock: ${product.stock}

${product.features}

¿Te interesa este producto? Responde *SI* para agregarlo al carrito 🛒`,

    paymentInstructions: `💳 *Métodos de Pago*

Aceptamos:
• Transferencia bancaria
• Tarjeta de crédito/débito
• PayPal
• Efectivo contra entrega

Para proceder con el pago, selecciona tu método preferido 👆`,

    shippingInfo: `🚚 *Información de Envío*

• Envío gratis en compras mayores a $50
• Entrega en 24-48 horas (área metropolitana)
• Entrega en 3-5 días (resto del país)
• Seguimiento en tiempo real

📍 Necesitaremos tu dirección de entrega`,

    promotions: `🎉 *Promociones Actuales*

🔥 *HOT SALE* - Hasta 50% de descuento
📱 2x1 en accesorios para celular
👕 20% OFF en toda la ropa
🎁 Envío gratis este fin de semana

Código promocional: *AHORRA2024*

¡Aprovecha estas ofertas! ⏰`,

    customerService: {
        greeting: `👋 Hola, soy del equipo de soporte.

¿En qué puedo ayudarte hoy?

1️⃣ Problema con un pedido
2️⃣ Cambios o devoluciones  
3️⃣ Información de productos
4️⃣ Otros`,

        waitTime: `⏳ Un momento por favor...

Estamos procesando tu solicitud. Tiempo estimado: 2-3 minutos.`,

        transferred: `🔄 Te estoy transfiriendo con un agente humano.

Por favor espera un momento...`
    },

    errors: {
        general: `❌ Lo siento, algo salió mal.

Por favor intenta de nuevo o escribe *ayuda* para ver las opciones disponibles.`,

        notAvailable: `⚠️ Este servicio no está disponible en este momento.

Nuestro horario de atención es:
Lunes a Viernes: 9:00 AM - 6:00 PM`,

        invalidInput: `❓ No entendí tu respuesta.

Por favor, selecciona una de las opciones disponibles o escribe *menu* para volver al inicio.`,

        connectionError: `📡 Parece que hay un problema de conexión.

Por favor, intenta nuevamente en unos momentos.`
    }
};