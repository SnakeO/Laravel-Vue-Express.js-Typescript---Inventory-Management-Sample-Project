ARG NODE_TAG=22.16.0

# Development stage
FROM node:${NODE_TAG}

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY ./src/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY ./src .

# Expose the API port
EXPOSE 3001

# Start the application with hot reload
CMD ["npm", "run", "dev"]
