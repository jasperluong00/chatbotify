'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
// import { prisma } from '@/lib/prisma'; // Direct client-side Prisma might not be ideal

interface UserWorkflowData {
    workflowPlatforms: string[];
    workflowGoals: string[];
    workflowTones: string[];
    workflowCompleted: boolean;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [workflowData, setWorkflowData] = useState<UserWorkflowData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkflowData = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        setIsLoading(true);
        try {
          // Fetch via API Route (Recommended)
          const response = await fetch('/api/user-workflow'); // Need to create this API route
          if (!response.ok) {
            throw new Error('Failed to fetch workflow data');
          }
          const data = await response.json();
          setWorkflowData(data);

        } catch (error) {
          console.error("Failed to fetch workflow data:", error);
        } finally {
          setIsLoading(false);
        }
      } else if (status === 'unauthenticated') {
          setIsLoading(false);
      }
    };

    fetchWorkflowData();
  }, [session, status]);

  if (isLoading || status === 'loading') {
    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
        </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Dashboard</h1>

      {workflowData && workflowData.workflowCompleted ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Chatbot Setup</h2>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Platforms</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{workflowData.workflowPlatforms?.join(', ') || 'N/A'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Main Goals</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{workflowData.workflowGoals?.join(', ') || 'N/A'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Chatbot Tones</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{workflowData.workflowTones?.join(', ') || 'N/A'}</dd>
            </div>
            {/* Add display for context files if tracked */}
          </dl>
        </div>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-200 p-4 rounded-md mb-6">
          It looks like you haven't completed the initial chatbot setup yet.
        </div>
      )}

      {/* Other dashboard content */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
         <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Placeholder Content</h2>
         <p className="text-gray-600 dark:text-gray-300">More dashboard widgets and information will appear here.</p>
      </div>

    </div>
  );
} 