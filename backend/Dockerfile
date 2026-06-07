# 1. Usamos una imagen oficial de Node.js ligera (alpine significa versión reducida)
FROM node:20-alpine

# 2. Creamos y nos movemos a una carpeta llamada /app dentro de la mini-computadora
WORKDIR /app

# 3. Copiamos el package.json y package-lock.json primero
COPY package*.json ./

# 4. Instalamos las dependencias exactas que necesita tu proyecto
RUN npm install

# 5. Copiamos todo el resto de tus archivos de código a la carpeta /app
COPY . .

# 6. Le avisamos a Docker que este contenedor se comunicará por el puerto 4000
EXPOSE 4000

# 7. El comando que se ejecutará cuando el contenedor se encienda
CMD ["npm", "run", "dev"]