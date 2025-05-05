#!/bin/bash

# Build the project
echo "Building the project..."
pnpm build

# Create a deployment directory
echo "Creating deployment directory..."
ssh htz "sudo mkdir -p /root/application-followups"

# Copy the necessary files to the server
echo "Copying files to server..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.next/cache' . htz:/root/application-followups/

# Install dependencies and start the service
echo "Installing dependencies and starting service..."
ssh htz "cd /root/application-followups && pnpm install --prod && sudo systemctl restart application-followups"

echo "Deployment complete!"
