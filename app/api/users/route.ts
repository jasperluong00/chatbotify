import { NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';
import { createUser, getUserByEmail, updateUser, deleteUser } from '../../lib/db';
import { prisma } from "../../lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { user: existingUser } = await getUserByEmail(email);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const { user, error } = await createUser(email, hashedPassword);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      // Return all users if no email is provided
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          companyName: true,
          createdAt: true,
        },
      });
      return NextResponse.json(users);
    }

    const { user, error } = await getUserByEmail(email);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 