import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route'; // Adjust path if necessary
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userWorkflowData = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        workflowPlatforms: true,
        workflowGoals: true,
        workflowTones: true,
        workflowCompleted: true,
        // Include context file info if needed
      },
    });

    if (!userWorkflowData) {
      // Should not happen if user exists, but good practice to check
      return new NextResponse('User workflow data not found', { status: 404 });
    }

    return NextResponse.json(userWorkflowData);

  } catch (error) {
    console.error("API Get User Workflow Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 