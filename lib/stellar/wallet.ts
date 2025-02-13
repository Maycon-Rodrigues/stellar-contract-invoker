import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  FreighterModule
} from '@creit.tech/stellar-wallets-kit';


export const walletKit = (networkPassphrase: WalletNetwork): StellarWalletsKit => {
  return new StellarWalletsKit({
    network: networkPassphrase,
    selectedWalletId: FREIGHTER_ID,
    modules: [new FreighterModule()],
  })
};

