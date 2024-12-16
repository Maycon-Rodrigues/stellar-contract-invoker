import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  FreighterModule
} from '@creit.tech/stellar-wallets-kit';


export const walletKit = (network: WalletNetwork): StellarWalletsKit => {
  return new StellarWalletsKit({
    network,
    selectedWalletId: FREIGHTER_ID,
    modules: [new FreighterModule()],
  })
};

