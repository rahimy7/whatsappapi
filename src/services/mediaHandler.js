const multer = require('multer');
const path = require('path');
const fs = require('fs');
const whatsappService = require('./whatsapp.service');

// Configurar almacenamiento de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../media');
        
        // Crear directorio si no existe
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generar nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtrar tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'audio/mpeg',
        'audio/ogg',
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido'), false);
    }
};

// Configurar multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 16 * 1024 * 1024 // 16 MB máximo
    }
});

class MediaHandler {
    // Subir imagen local y enviarla por WhatsApp
    async uploadAndSendImage(to, imagePath, caption = '') {
        try {
            // Subir imagen a WhatsApp
            const mediaId = await whatsappService.uploadMedia(imagePath, 'image/jpeg');
            
            // Enviar imagen usando el ID
            const response = await this.sendImageById(to, mediaId, caption);
            
            return response;
        } catch (error) {
            console.error('Error subiendo y enviando imagen:', error);
            throw error;
        }
    }

    // Enviar imagen por ID de media
    async sendImageById(to, mediaId, caption = '') {
        try {
            const response = await axios.post(
                `${whatsappService.apiUrl}/messages`,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: to,
                    type: 'image',
                    image: {
                        id: mediaId,
                        caption: caption
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${whatsappService.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return response.data;
        } catch (error) {
            console.error('Error enviando imagen por ID:', error);
            throw error;
        }
    }

    // Enviar documento
    async sendDocument(to, documentUrl, filename, caption = '') {
        try {
            const response = await axios.post(
                `${whatsappService.apiUrl}/messages`,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: to,
                    type: 'document',
                    document: {
                        link: documentUrl,
                        filename: filename,
                        caption: caption
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${whatsappService.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return response.data;
        } catch (error) {
            console.error('Error enviando documento:', error);
            throw error;
        }
    }

    // Enviar video
    async sendVideo(to, videoUrl, caption = '') {
        try {
            const response = await axios.post(
                `${whatsappService.apiUrl}/messages`,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: to,
                    type: 'video',
                    video: {
                        link: videoUrl,
                        caption: caption
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${whatsappService.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return response.data;
        } catch (error) {
            console.error('Error enviando video:', error);
            throw error;
        }
    }

    // Enviar audio
    async sendAudio(to, audioUrl) {
        try {
            const response = await axios.post(
                `${whatsappService.apiUrl}/messages`,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: to,
                    type: 'audio',
                    audio: {
                        link: audioUrl
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${whatsappService.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return response.data;
        } catch (error) {
            console.error('Error enviando audio:', error);
            throw error;
        }
    }

    // Enviar ubicación
    async sendLocation(to, latitude, longitude, name, address) {
        try {
            const response = await axios.post(
                `${whatsappService.apiUrl}/messages`,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: to,
                    type: 'location',
                    location: {
                        latitude: latitude,
                        longitude: longitude,
                        name: name,
                        address: address
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${whatsappService.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return response.data;
        } catch (error) {
            console.error('Error enviando ubicación:', error);
            throw error;
        }
    }

    // Enviar sticker
    async sendSticker(to, stickerUrl) {
        try {
            const response = await axios.post(
                `${whatsappService.apiUrl}/messages`,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: to,
                    type: 'sticker',
                    sticker: {
                        link: stickerUrl
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${whatsappService.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return response.data;
        } catch (error) {
            console.error('Error enviando sticker:', error);
            throw error;
        }
    }

    // Limpiar archivos antiguos (más de 7 días)
    cleanOldFiles() {
        const mediaPath = path.join(__dirname, '../../media');
        const now = Date.now();
        const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

        fs.readdir(mediaPath, (err, files) => {
            if (err) {
                console.error('Error leyendo directorio media:', err);
                return;
            }

            files.forEach(file => {
                const filePath = path.join(mediaPath, file);
                
                fs.stat(filePath, (err, stats) => {
                    if (err) return;
                    
                    if (stats.mtime.getTime() < sevenDaysAgo) {
                        fs.unlink(filePath, err => {
                            if (err) {
                                console.error('Error eliminando archivo:', err);
                            } else {
                                console.log('Archivo eliminado:', file);
                            }
                        });
                    }
                });
            });
        });
    }
}

module.exports = {
    MediaHandler: new MediaHandler(),
    upload
};
