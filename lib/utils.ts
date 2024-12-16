import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { parameterTypes, ParameterType } from './parameter-types';
import { Address, XdrLargeInt, xdr } from "@stellar/stellar-sdk";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function formatWallerAddresse(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

type ParameterTypeObject = {
  key: ParameterType;
  value: any;
}

export function handleParameterType(args: Array<Array<ParameterTypeObject>>) {
  let params: any = [];

  args[0].map(arg => {
    switch (arg.key) {
      case parameterTypes.ADDRESS:
        return params.push(Address.fromString(arg.value).toScVal());
      case parameterTypes.BOOL:
        return params.push(xdr.ScVal.scvBool(arg.value));
      case parameterTypes.BYTES:
        return params.push(xdr.ScVal.scvBytes(arg.value));
      case parameterTypes.I32:
        return params.push(xdr.ScVal.scvI32(arg.value));
      case parameterTypes.I64:
        return params.push(new XdrLargeInt("i64", arg.value).toI64());
      case parameterTypes.I128:
        return params.push(new XdrLargeInt("i128", arg.value).toI128());
      case parameterTypes.I256:
        return params.push(new XdrLargeInt("i256", arg.value).toI256());
      case parameterTypes.U32:
        return params.push(xdr.ScVal.scvU32(arg.value));
      case parameterTypes.U64:
        return params.push(new XdrLargeInt("u64", arg.value).toU64());
      case parameterTypes.U128:
        return params.push(new XdrLargeInt("u128", arg.value).toU64());
      case parameterTypes.U256:
        return params.push(new XdrLargeInt("u256", arg.value).toU256());
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
  })

  return params;
};
