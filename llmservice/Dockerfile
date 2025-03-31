# Usa la imagen oficial de Node.js
FROM node:20

# Directorio de trabajo general para tu aplicación (sin incluir 'src' aquí)
WORKDIR /usr/src/llmservice

# Copia package.json y package-lock.json primero para optimizar caché de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia todos los archivos del proyecto al directorio de trabajo
COPY . .

# Comando de arranque ajustado para reflejar la carpeta 'src'
CMD ["node", "src/llm-service.js"]
