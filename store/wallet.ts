import { WalletNetwork } from '@creit.tech/stellar-wallets-kit'
import { create } from 'zustand'

type WalletStore = {
  address: string | null;
  networkPassphrase: WalletNetwork;
  network: string | null;
  setNetwork: (network: WalletNetwork) => void;
  setAddress: (address: string) => void;
  setNetworkPassphrase: (networkPassphrase: WalletNetwork) => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  address: null,
  networkPassphrase: WalletNetwork.TESTNET,
  network: null,
  setNetwork: (network: WalletNetwork) => set({ network }),
  setAddress: (address: string) => set({ address }),
  setNetworkPassphrase: (networkPassphrase: WalletNetwork) => set({ networkPassphrase }),
}))
