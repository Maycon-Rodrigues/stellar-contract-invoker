import { useState, useEffect } from 'react';
import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  FreighterModule
} from '@creit.tech/stellar-wallets-kit';

const useStellarWalletsKit = () => {
  // const [kit, setKit] = useState<StellarWalletsKit | null>(null);
  const [kit, setKit] = useState<StellarWalletsKit>(new StellarWalletsKit({
    network: WalletNetwork.TESTNET,
    selectedWalletId: FREIGHTER_ID,
    modules: [new FreighterModule()],
  })
  );

  useEffect(() => {
    // Inicialize kit
    const initializeKit = () => {
      const newKit = new StellarWalletsKit({
        network: WalletNetwork.TESTNET,
        selectedWalletId: FREIGHTER_ID,
        modules: [new FreighterModule()],
      });

      setKit(newKit);
    };

    initializeKit();
  }, []);

  return kit;
};

export default useStellarWalletsKit;
