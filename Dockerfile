FROM node:14-alpine
RUN npm install -g live-server
WORKDIR /app
# COPY index.html /app
# COPY keycloak /app/keycloak
COPY . .
CMD ["live-server", "--port=5500", "--entry-file=/app/index.html"]


# # Use the official Node.js image
# FROM node:alpine

# # Set the working directory
# WORKDIR /app

# # Copy the package.json and package-lock.json files to the container
# COPY package*.json ./

# # Install the dependencies
# RUN npm install

# # Copy the application code to the container
# COPY . .

# # Expose port 3000 for the application
# # EXPOSE 3000

# # Start the application
# CMD ["npm", "start"]



# Simple no-node image:
# FROM node:alpine
# FROM alpine

# WORKDIR /app
# COPY . .

# CMD ["", "index.html"]