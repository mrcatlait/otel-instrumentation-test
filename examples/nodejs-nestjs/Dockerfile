# Use the official Node.js image as the base image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Set the environment variables
ENV PORT=3000

# Run the application
CMD ["node", "--require", "@opentelemetry/auto-instrumentations-node/register", "dist/main.js"]
