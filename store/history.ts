import { WalletNetwork } from '@creit.tech/stellar-wallets-kit'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type HistoryStore = {
  contractId: string
  functionName: string
  networkPassphrase: WalletNetwork
  parameters: string[]
  timestamp: string
  status: string
}

type HistoriesStore = {
  histories: HistoryStore[]
  setHistories: (histories: HistoryStore[]) => void
  addHistory: (history: HistoryStore) => void
  clearHistories: () => void
}

export const useHistoryStore = create<HistoriesStore>()(
  persist(
    (set) => ({
      histories: [],

      setHistories: (histories) => set({ histories }),

      addHistory: (history) =>
        set((state) => {
          const updatedHistories = [...state.histories, history]

          // Mantendo no máximo 10 registros
          if (updatedHistories.length > 10) {
            updatedHistories.shift() // Remove o mais antigo
          }

          return { histories: updatedHistories }
        }),

      clearHistories: () => set({ histories: [] }),
    }),
    {
      name: 'history-storage', // Nome da chave no localStorage
      partialize: (state) => ({ histories: state.histories || [] }), // Garante que o valor inicial é um array vazio
    }
  )
)

