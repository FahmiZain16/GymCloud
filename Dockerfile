FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Create storage directory
RUN mkdir -p /app/storage

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
