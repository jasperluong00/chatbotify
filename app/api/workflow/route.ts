import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route'; // Adjust path if necessary
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { platforms, goals, tones, workflowCompleted } = body;

    // Basic validation (add more as needed)
    if (!Array.isArray(platforms) || !Array.isArray(goals) || !Array.isArray(tones) || typeof workflowCompleted !== 'boolean') {
        return new NextResponse('Invalid data format', { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        workflowPlatforms: platforms,
        workflowGoals: goals,
        workflowTones: tones,
        workflowCompleted: workflowCompleted,
        // TODO: Add logic to handle saving info about uploaded context files
      },
    });

    return NextResponse.json({ message: 'Workflow data saved', user: updatedUser });

  } catch (error) {
    console.error("API Workflow Save Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 