'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useWorkflowStore, UploadedFileInfo } from '@/lib/workflow-store';
import { motion, AnimatePresence } from 'framer-motion';

// Loading Overlay Component
const LoadingOverlay = ({ progress, emoji }: { progress: number, emoji: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50"
  >
    <div className="text-6xl mb-4 animate-bounce">{emoji}</div>
    <div className="w-64 bg-gray-700 rounded-full h-2.5">
      <motion.div
        className="bg-blue-600 h-2.5 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "linear" }}
      />
    </div>
    <p className="mt-4 text-white text-lg">Setting things up...</p>
  </motion.div>
);

const steps = [
  { id: 'platforms', title: 'Where will your chatbot live?', emoji: '🌐' },
  { id: 'goals', title: 'What are the main goals? (Max 3)', emoji: '🏆' },
  { id: 'tones', title: 'Choose a personality (Max 2)', emoji: '🎭' },
  { id: 'contextUpload', title: 'Add context? (Optional)', emoji: '📎' },
  { id: 'summary', title: 'Ready to launch?', emoji: '🚀' },
];

const platformOptions = ['Instagram', 'Website', 'Shopify', 'WhatsApp', 'Facebook Messenger', 'Other'];
const goalOptions = ['Lead Generation', 'Customer Support', 'Sales Assistance', 'Bookings/Appointments', 'FAQ Answering', 'Other'];
const toneOptions = ['Friendly', 'Professional', 'Witty', 'Empathetic', 'Direct'];

export default function WorkflowPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    platforms, setPlatforms,
    goals, setGoals,
    tones, setTones,
    uploadedContextFiles, setUploadedContextFiles,
    completeWorkflow, resetWorkflow,
  } = useWorkflowStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingEmoji, setLoadingEmoji] = useState('✨');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (useWorkflowStore.getState().completed === false) {
        resetWorkflow();
    }
  }, [resetWorkflow]);

  const handleNext = () => {
    setDirection(1);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files).map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
      }));
      setUploadedContextFiles(filesArray);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFinish = async () => {
    setIsLoading(true);
    setLoadingEmoji('🔧');
    setLoadingProgress(0);

    // TODO: Actual File Upload Logic Here
    // Example: if (uploadedContextFiles.length > 0) { await uploadFiles(uploadedContextFiles); }

    await new Promise(res => setTimeout(res, 500)); setLoadingProgress(33); setLoadingEmoji('🧠');
    await new Promise(res => setTimeout(res, 700)); setLoadingProgress(66); setLoadingEmoji('🔗');
    await new Promise(res => setTimeout(res, 800)); setLoadingProgress(100); setLoadingEmoji('✅');
    await new Promise(res => setTimeout(res, 500));

    // Only mark as completed *after* potential backend save
    completeWorkflow();
    setIsLoading(false);

    if (status === 'authenticated') {
      // Trigger backend save *before* redirecting
      await saveWorkflowToBackend();
      router.push('/dashboard');
    } else {
      router.push('/auth/signup?fromWorkflow=true');
    }
  };

  // API call function (needs implementation)
  const saveWorkflowToBackend = async () => {
      if (!session?.user?.id) return; // Ensure user is logged in
      try {
        const response = await fetch('/api/workflow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platforms,
            goals,
            tones,
            workflowCompleted: true,
            // Include file upload info if needed (e.g., URLs from upload)
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to save workflow data');
        }
        console.log('Workflow data saved successfully');
      } catch (error) {
        console.error("Error saving workflow data:", error);
        // Handle error appropriately (e.g., show a message to the user)
      }
  };

  const togglePlatform = (platform: string) => {
    setPlatforms(
      platforms.includes(platform)
        ? platforms.filter((p) => p !== platform)
        : [...platforms, platform]
    );
  };

  const toggleGoal = (goal: string) => {
    setGoals((prevGoals: string[]) =>
      prevGoals.includes(goal)
        ? prevGoals.filter((g: string) => g !== goal)
        : prevGoals.length < 3 ? [...prevGoals, goal] : prevGoals
    );
  };

  const toggleTone = (tone: string) => {
    setTones((prevTones: string[]) =>
      prevTones.includes(tone)
        ? prevTones.filter((t: string) => t !== tone)
        : prevTones.length < 2 ? [...prevTones, tone] : prevTones
    );
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 300 : -300, opacity: 0 }),
  };

  const renderStepContent = () => {
    const stepId = steps[currentStep].id;

    switch (stepId) {
      case 'platforms':
        return (
          <div className="grid grid-cols-2 gap-3">
            {platformOptions.map((p: string) => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`p-3 border rounded-lg text-center transition ${platforms.includes(p) ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600'}`}>
                {p}
              </button>
            ))}
          </div>
        );
      case 'goals':
        return (
          <div className="space-y-3">
             <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">Select up to 3.</p>
            {goalOptions.map((g: string) => (
              <button
                key={g}
                onClick={() => toggleGoal(g)}
                disabled={goals.length >= 3 && !goals.includes(g)}
                className={`w-full p-3 border rounded-lg text-left transition ${goals.includes(g) ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'}`}>
                {g}
              </button>
            ))}
          </div>
        );
      case 'tones':
        return (
          <div className="grid grid-cols-2 gap-3">
             <p className="text-sm text-gray-500 dark:text-gray-400 text-center col-span-2 mb-2">Select up to 2.</p>
            {toneOptions.map((t: string) => (
              <button
                key={t}
                onClick={() => toggleTone(t)}
                disabled={tones.length >= 2 && !tones.includes(t)}
                className={`p-3 border rounded-lg text-center transition ${tones.includes(t) ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'}`}>
                {t}
              </button>
            ))}
          </div>
        );
      case 'contextUpload':
        return (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upload documents (PDF, TXT, DOCX) or connect data sources to give your chatbot specific knowledge.
            </p>
            <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.txt,.docx" />
            <button onClick={triggerFileInput} className="mb-4 px-6 py-2 border border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition">
              Select Files
            </button>
            {uploadedContextFiles.length > 0 && (
              <div className="mt-4 text-sm text-left text-gray-500 dark:text-gray-400 space-y-1">
                <p className="font-medium">Selected:</p>
                <ul className="list-disc list-inside">
                  {uploadedContextFiles.map((file, index) => (
                    <li key={index}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                  ))}
                </ul>
              </div>
            )}
             <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">You can skip this and add context later.</p>
          </div>
        );
      case 'summary':
        return (
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p><strong>Platforms:</strong> {platforms.length > 0 ? platforms.join(', ') : 'Not set'}</p>
            <p><strong>Goals:</strong> {goals.length > 0 ? goals.join(', ') : 'Not set'}</p>
            <p><strong>Tones:</strong> {tones.length > 0 ? tones.join(', ') : 'Not set'}</p>
            <p><strong>Context Files:</strong> {uploadedContextFiles.length > 0 ? `${uploadedContextFiles.length} file(s)` : 'None added'}</p>
            <p className="pt-4 text-sm text-gray-500 dark:text-gray-400">Click Finish to finalize your initial setup.</p>
          </div>
        );
      default:
        return null;
    }
  };

  const canGoNext = () => {
    switch (steps[currentStep].id) {
      case 'platforms': return platforms.length > 0;
      case 'goals': return goals.length > 0;
      case 'tones': return tones.length > 0;
      case 'contextUpload': return true;
      case 'summary': return true;
      default: return false;
    }
  }

  return (
    <>
      <AnimatePresence>{isLoading && <LoadingOverlay progress={loadingProgress} emoji={loadingEmoji} />}</AnimatePresence>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 p-4">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 relative">
            <motion.div
              className="h-2 bg-blue-600 absolute left-0 top-0 bottom-0"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / (steps.length -1)) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
             <motion.div
                className="absolute -top-3 text-xl"
                style={{ transform: 'translateX(-50%)' }}
                initial={{ left: '0%' }}
                animate={{ left: `${(currentStep / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            >
                {steps[currentStep].emoji}
            </motion.div>
          </div>
          <div className="p-6 md:p-8 min-h-[400px] flex flex-col">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter" animate="center" exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="flex-grow"
              >
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
                  {steps[currentStep].title}
                </h2>
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <button
                onClick={handleBack}
                disabled={currentStep === 0 || isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              > Back </button>
              {steps[currentStep].id === 'summary' ? (
                <button
                  onClick={handleFinish}
                  disabled={isLoading}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
                > {isLoading ? 'Setting up...' : 'Finish Setup'} </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!canGoNext() || isLoading}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {steps[currentStep].id === 'contextUpload' ? 'Next / Skip' : 'Next'}
                </button>
              )}
            </div>
          </div>
        </div>
        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400"> You can always change these settings later. </p>
      </div>
    </>
  );
} 