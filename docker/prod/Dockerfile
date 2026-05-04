# Use the official Node.js image as our base
FROM node:22-alpine as builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install app dependencies
RUN npm ci

# Copy the rest of our app's source code into the container
COPY . .

RUN npm run build

FROM node:22-alpine as production

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-scripts

COPY --from=builder /app/dist ./

# Expose the port the app will run on
EXPOSE 5500

# The command to run our app
CMD ["node","src/server.js"]
