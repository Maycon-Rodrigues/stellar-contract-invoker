import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWalletStore } from "@/store/wallet";
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit";

export function NetworkSelector() {
  const { networkPassphrase, setNetworkPassphrase } = useWalletStore();


  async function handleSelect(value: WalletNetwork) {
    setNetworkPassphrase(value);
  }

  return (
    <Select value={networkPassphrase} onValueChange={handleSelect}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select network" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={WalletNetwork.PUBLIC}>Mainnet</SelectItem>
        <SelectItem value={WalletNetwork.TESTNET}>Testnet</SelectItem>
        <SelectItem value={WalletNetwork.FUTURENET}>Futurenet</SelectItem>
      </SelectContent>
    </Select>
  );
}
