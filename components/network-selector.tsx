import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit";

interface NetworkSelectorProps {
  value: string;
  onValueChange: (value: WalletNetwork) => void;
}

export function NetworkSelector({ value, onValueChange }: NetworkSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
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
