ARG NODE_TAG=22.16.0

# Development stage
FROM node:${NODE_TAG}

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Copy the rest of the application code
COPY . .

# Expose the development port (Vite default is 3000)
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]