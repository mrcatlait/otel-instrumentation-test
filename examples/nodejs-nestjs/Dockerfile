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
ENV NODE_ENV=production
ENV OTEL_LOG_LEVEL=debug
ENV OTEL_TRACES_EXPORTER="otlp"
ENV OTEL_EXPORTER_OTLP_PROTOCOL="http/json"
ENV OTEL_EXPORTER_OTLP_COMPRESSION="gzip"
ENV OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="http://host.docker.internal:4317/v1/traces"
ENV OTEL_RESOURCE_ATTRIBUTES="appname=nodejs-nestjs"
ENV OTEL_SERVICE_NAME="nodejs-nestjs"

# Run the application
CMD ["node", "--require", "@opentelemetry/auto-instrumentations-node/register", "dist/main.js"]
