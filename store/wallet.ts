import { ISupportedWallet, WalletNetwork } from '@creit.tech/stellar-wallets-kit'
import { create } from 'zustand'

type Wallet = {
  address: string;
}

type WalletStore = {
  wallet: Wallet | null;
  network: WalletNetwork;
  setNetwork: (network: WalletNetwork) => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  wallet: null,
  network: WalletNetwork.TESTNET,
  setNetwork: (network: WalletNetwork) => set({ network }),
}))
