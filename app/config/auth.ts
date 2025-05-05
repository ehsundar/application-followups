export interface User {
  username: string;
  password: string;
  name: string;
}

export const users: User[] = [
  {
    username: 'admin',
    password: 'admin123',
    name: 'Administrator'
  },
  {
    username: 'john',
    password: 'john123',
    name: 'John Smith'
  },
  {
    username: 'sarah',
    password: 'sarah123',
    name: 'Sarah Johnson'
  },
  {
    username: 'mike',
    password: 'mike123',
    name: 'Mike Williams'
  }
];
