# 1️⃣ Usa Node.js para construir la aplicación React
FROM node:22 as build

WORKDIR /llmservice

# Copia los archivos y ejecuta la instalación
COPY llmservicepackage*.json ./
RUN npm install

# Copia el resto del código fuente
COPY . .

# Construye la aplicación
RUN npm run build

# 2️⃣ Usa Nginx para servir la aplicación en producción
FROM nginx:alpine

# Copia los archivos de la build a la carpeta de Nginx
COPY --from=build /llmservice/build /usr/share/nginx/html

# Expone el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
