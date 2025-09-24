// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { User } from '@/types';

const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

// Helper function to read users from the JSON file
const readUsers = (): User[] => {
  try {
    if (fs.existsSync(usersFilePath)) {
      const fileContent = fs.readFileSync(usersFilePath, 'utf-8');
      return JSON.parse(fileContent) as User[];
    }
    return [];
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
};

// Helper function to write users to the JSON file
const writeUsers = (users: User[]) => {
  try {
    // Ensure the directory exists
    const dir = path.dirname(usersFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing users file:', error);
  }
};

// GET: Fetch all users
export async function GET() {
  const users = readUsers();
  return NextResponse.json(users);
}

// POST: Create or update a user (handles registration, creation, status updates)
export async function POST(request: Request) {
  const body = await request.json();
  const { action, payload } = body;
  
  let users = readUsers();

  switch (action) {
    case 'createUser': {
      const { username, password } = payload;
      if (users.some(u => u.username === username)) {
        return NextResponse.json({ success: false, message: `User "${username}" already exists.` }, { status: 409 });
      }
      const newUser: User = {
        username,
        password,
        isAdmin: false,
        status: 'approved',
        joined: new Date().toISOString()
      };
      users.push(newUser);
      writeUsers(users);
      return NextResponse.json({ success: true, message: `User "${username}" created successfully.`, user: newUser });
    }
    
    case 'updateUserStatus': {
       const { username, status, reason } = payload;
       const userIndex = users.findIndex(u => u.username === username);
       if (userIndex === -1) {
         return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
       }
       if (users[userIndex].isAdmin) {
         return NextResponse.json({ success: false, message: "Cannot change admin status." }, { status: 403 });
       }
       
       users[userIndex].status = status;
       if (status === 'revoked') {
         users[userIndex].revocationReason = reason;
         users[userIndex].revokedAt = new Date().toISOString();
       } else {
         delete users[userIndex].revocationReason;
         delete users[userIndex].revokedAt;
       }
       writeUsers(users);
       return NextResponse.json({ success: true, message: "User status updated.", user: users[userIndex] });
    }
    
    default:
      return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  }
}

// DELETE: Remove a user
export async function DELETE(request: Request) {
    const { username } = await request.json();
    if (!username) {
        return NextResponse.json({ success: false, message: 'Username is required' }, { status: 400 });
    }

    let users = readUsers();
    const initialLength = users.length;
    users = users.filter(u => u.username !== username);

    if (users.length === initialLength) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    writeUsers(users);
    return NextResponse.json({ success: true, message: 'User deleted successfully' });
}
