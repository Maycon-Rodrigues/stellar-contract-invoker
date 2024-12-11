export const parameterTypes = {
  ADDRESS: 'Address',
  BOOL: 'Bool',
  BYTES: 'Bytes',
  I32: 'I32',
  I64: 'I64',
  I128: 'I128',
  I256: 'I256',
  U32: 'U32',
  U64: 'U64',
  U128: 'U128',
  U256: 'U256',
  MAP: 'Map',
  STRING: 'String',
  SYMBOL: 'Symbol',
  VEC: 'Vec',
} as const;

export type ParameterType = typeof parameterTypes[keyof typeof parameterTypes];
