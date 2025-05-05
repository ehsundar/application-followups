import fs from 'fs';
import path from 'path';

export interface User {
  username: string;
  password: string;
  name: string;
}

function loadUsers(): User[] {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const credentialsPath = path.join(process.cwd(), 'app', 'config', 'credentials.json');
  const samplePath = path.join(process.cwd(), 'app', 'config', 'credentials.sample.json');

  try {
    const fileContent = fs.readFileSync(credentialsPath, 'utf-8');
    return JSON.parse(fileContent).users;
  } catch {
    if (isDevelopment) {
      // Only use sample credentials in development
      console.warn('Production credentials not found, using sample credentials (development only)');
      const sampleContent = fs.readFileSync(samplePath, 'utf-8');
      return JSON.parse(sampleContent).users;
    }

    // In production, use environment variables if available
    const envUsername = process.env.ADMIN_USERNAME;
    const envPassword = process.env.ADMIN_PASSWORD;
    const envName = process.env.ADMIN_NAME;

    if (envUsername && envPassword) {
      return [{
        username: envUsername,
        password: envPassword,
        name: envName || 'Administrator'
      }];
    }

    // If no environment variables are set, throw an error
    throw new Error('No credentials found. Please either:\n' +
      '1. Create app/config/credentials.json\n' +
      '2. Set ADMIN_USERNAME and ADMIN_PASSWORD environment variables\n' +
      '3. Use credentials.sample.json in development mode');
  }
}

export const users: User[] = loadUsers();
