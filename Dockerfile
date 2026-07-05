FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Change permissions so that the huggingface user (UID 1000) can write to the directory (e.g., for database.json)
RUN chown -R 1000:1000 /app

# Switch to the huggingface user
USER 1000

# Set production environment and port
ENV NODE_ENV=production
ENV PORT=7860
EXPOSE 7860

# Start the application
CMD ["npm", "start"]
