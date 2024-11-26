"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NetworkSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function NetworkSelector({ value, onValueChange }: NetworkSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select network" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="mainnet">Mainnet</SelectItem>
        <SelectItem value="testnet">Testnet</SelectItem>
        <SelectItem value="futurenet">Futurenet</SelectItem>
      </SelectContent>
    </Select>
  );
}