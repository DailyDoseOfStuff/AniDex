# --- Stage 1: Build the app ---
FROM node:20-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the Vite application for production
RUN npm run build

# --- Stage 2: Serve the app with Nginx ---
FROM nginx:alpine

# Remove the default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the built app from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to the host network
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
