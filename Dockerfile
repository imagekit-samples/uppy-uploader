FROM node:20-bullseye

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN yarn build

# Expose port
EXPOSE 3020

# Start the server
CMD ["yarn", "start"]

