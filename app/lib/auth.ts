import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function getUserFromAuthCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;
  if (!token) {
    throw new Error('Not authenticated');
  }
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  let payload;
  try {
    ({ payload } = await jwtVerify(token, secret));
  } catch {
    throw new Error('Invalid or expired token');
  }
  if (!payload || typeof payload.email !== 'string') {
    throw new Error('Invalid token payload');
  }
  return payload;
}
