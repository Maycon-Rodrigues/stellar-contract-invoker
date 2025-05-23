import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parameterTypes, ParameterType } from "./parameter-types";
import { Address, XdrLargeInt, xdr } from "@stellar/stellar-sdk";
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getNetworkRPC(networkPassphrase: WalletNetwork): string {
  switch (networkPassphrase) {
    case WalletNetwork.PUBLIC:
      return "https://mainnet.sorobanrpc.com";
    case WalletNetwork.TESTNET:
      return "https://soroban-testnet.stellar.org:443";
    default:
      return "https://soroban-testnet.stellar.org:443";
  }
}

export function formatWallerAddresse(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function formatResult(result: unknown) {
  if (typeof result === "object") {
    return JSON.stringify(result, null, 2);
  }
  return result?.toString();
}

type ParameterTypeObject = {
  key: ParameterType;
  value: any;
};

export function handleParameterType(args: Array<ParameterTypeObject>) {
  let params: any = [];

  args.map((arg) => {
    switch (arg.key) {
      case parameterTypes.ADDRESS:
        return params.push(Address.fromString(arg.value).toScVal());
      case parameterTypes.BOOL:
        return params.push(xdr.ScVal.scvBool(arg.value));
      case parameterTypes.BYTES:
        return params.push(xdr.ScVal.scvBytes(arg.value));
      case parameterTypes.I32:
        return params.push(xdr.ScVal.scvI32(+arg.value));
      case parameterTypes.I64:
        return params.push(new XdrLargeInt("i64", +arg.value).toI64());
      case parameterTypes.I128:
        return params.push(new XdrLargeInt("i128", +arg.value).toI128());
      case parameterTypes.U32:
        return params.push(xdr.ScVal.scvU32(+arg.value));
      case parameterTypes.U64:
        return params.push(new XdrLargeInt("u64", +arg.value).toU64());
      case parameterTypes.U128:
        return params.push(new XdrLargeInt("u128", +arg.value).toU64());
      case parameterTypes.MAP:
        return params.push(xdr.ScVal.scvMap(arg.value));
      case parameterTypes.STRING:
        return params.push(xdr.ScVal.scvString(arg.value));
      case parameterTypes.SYMBOL:
        return params.push(xdr.ScVal.scvSymbol(arg.value));
      case parameterTypes.VEC:
        params.push(xdr.ScVal.scvVec(arg.value));
      default:
        throw new Error(`Unhandled parameter type: ${arg.key}`);
    }
  });

  return params;
}

export function formatType(typeInfo: any): string {
  // Esta função não é mais usada diretamente para o retorno da API, mas pode ser útil manter
  if (!typeInfo) return "void";
  if (typeof typeInfo === "string") return typeInfo; // Tipos básicos

  if (typeInfo.name && typeInfo.generics) {
    // Tipos com genéricos (Map, Vec, Option...)
    const generics = typeInfo.generics.map(formatType).join(", ");
    return `${typeInfo.name}<${generics}>`;
  }
  if (typeInfo.name) {
    // Structs, Enums, etc.
    return typeInfo.name;
  }

  return JSON.stringify(typeInfo); // Fallback
}

export function handleError(error: string): string {
  switch (error) {
    case "Cannot read properties of undefined (reading 'latestLedger')":
      return "Contract not found, verify your network.";
    default:
      return error;
  }
}
