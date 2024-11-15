# Use the Node.js alpine image
FROM node:16-alpine

# Install Python, pip, and build tools for native modules and Python scripts
RUN apk add --no-cache python3 py3-pip make g++ 

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Rebuild bcrypt to ensure compatibility with the alpine environment
RUN npm rebuild bcrypt --build-from-source

# Install Python dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "start:dev"]
