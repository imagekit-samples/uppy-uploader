FROM node:20-bullseye

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

ENV CI=true

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source files
COPY . .


# Expose port
EXPOSE 3020

# Start the server
CMD ["yarn", "start"]

