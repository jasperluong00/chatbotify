import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Note: Storing actual File objects in sessionStorage is not reliable.
// We'll store basic info or just a flag for now.
export interface UploadedFileInfo {
  name: string;
  size: number;
  type: string;
}

interface WorkflowState {
  platforms: string[];
  goals: string[];
  tones: string[];
  uploadedContextFiles: UploadedFileInfo[]; // Store basic file info
  completed: boolean;
  setPlatforms: (platforms: string[]) => void;
  setGoals: (updater: (prevGoals: string[]) => string[]) => void;
  setTones: (updater: (prevTones: string[]) => string[]) => void;
  setUploadedContextFiles: (files: UploadedFileInfo[]) => void;
  completeWorkflow: () => void;
  resetWorkflow: () => void;
}

const initialState = {
  platforms: [],
  goals: [],
  tones: [],
  uploadedContextFiles: [],
  completed: false,
};

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set) => ({
      ...initialState,
      setPlatforms: (platforms) => set({ platforms }),
      setGoals: (updater) => set((state) => ({ goals: updater(state.goals) })),
      setTones: (updater) => set((state) => ({ tones: updater(state.tones) })),
      setUploadedContextFiles: (files) => set({ uploadedContextFiles: files }),
      completeWorkflow: () => set({ completed: true }),
      resetWorkflow: () => set({ ...initialState }),
    }),
    {
      name: 'workflow-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
); 