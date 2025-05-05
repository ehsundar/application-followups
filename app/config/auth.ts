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

  try {
    const fileContent = fs.readFileSync(credentialsPath, 'utf-8');
    return JSON.parse(fileContent).users;
  } catch (error) {
    if (isDevelopment) {
      // Only use sample credentials in development
      console.warn('Production credentials not found, using sample credentials (development only)');
      const samplePath = path.join(process.cwd(), 'app', 'config', 'credentials.sample.json');
      const sampleContent = fs.readFileSync(samplePath, 'utf-8');
      return JSON.parse(sampleContent).users;
    }

    // In production, throw an error if credentials are missing
    throw new Error('Production credentials file not found. Please create app/config/credentials.json');
  }
}

export const users: User[] = loadUsers();
