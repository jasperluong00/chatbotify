import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function createUser(email: string, hashedPassword: string) {
  try {
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
      },
    });
    return { user };
  } catch (error) {
    return { error };
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
        sessions: true,
      },
    });
    return { user };
  } catch (error) {
    return { error };
  }
}

export async function updateUser(userId: string, data: Partial<{ email: string; hashedPassword: string }>) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });
    return { user };
  } catch (error) {
    return { error };
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    return { success: true };
  } catch (error) {
    return { error };
  }
} 