FROM node:20

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm install

# Install tsx globally for development
RUN npm install -g tsx

# Copy source code
COPY . .

# Expose the port
EXPOSE 3001

# Use tsx directly for development (no build needed)
CMD ["npm", "run", "dev"]
