import { create } from 'zustand'

type ExplorerStore = {
  initialData: {
    contractId: string;
    functionName: string;
    parameters: any[];
  } | null;
  setInitialData: (data: {
    contractId: string;
    functionName: string;
    parameters: any[];
  } | null) => void;
}

export const useExplorerStore = create<ExplorerStore>()((set) => ({
  initialData: null,
  setInitialData: (data) => set({ initialData: data }),
})) 