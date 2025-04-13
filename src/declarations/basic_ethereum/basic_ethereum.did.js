export const idlFactory = ({ IDL }) => {
  const EthereumNetwork = IDL.Variant({
    'Mainnet' : IDL.Null,
    'Sepolia' : IDL.Null,
  });
  const EcdsaKeyName = IDL.Variant({
    'ProductionKey1' : IDL.Null,
    'TestKeyLocalDevelopment' : IDL.Null,
    'TestKey1' : IDL.Null,
  });
  const InitArg = IDL.Record({
    'ethereum_network' : IDL.Opt(EthereumNetwork),
    'ecdsa_key_name' : IDL.Opt(EcdsaKeyName),
  });
  const Wei = IDL.Nat;
  const BlockTag = IDL.Variant({
    'Earliest' : IDL.Null,
    'Safe' : IDL.Null,
    'Finalized' : IDL.Null,
    'Latest' : IDL.Null,
    'Number' : IDL.Nat,
    'Pending' : IDL.Null,
  });
  return IDL.Service({
    'ethereum_address' : IDL.Func([IDL.Opt(IDL.Principal)], [IDL.Text], []),
    'get_balance' : IDL.Func([IDL.Opt(IDL.Text)], [Wei], []),
    'send_eth' : IDL.Func([IDL.Text, Wei], [IDL.Text], []),
    'transaction_count' : IDL.Func(
        [IDL.Opt(IDL.Principal), IDL.Opt(BlockTag)],
        [IDL.Nat],
        [],
      ),
  });
};
export const init = ({ IDL }) => {
  const EthereumNetwork = IDL.Variant({
    'Mainnet' : IDL.Null,
    'Sepolia' : IDL.Null,
  });
  const EcdsaKeyName = IDL.Variant({
    'ProductionKey1' : IDL.Null,
    'TestKeyLocalDevelopment' : IDL.Null,
    'TestKey1' : IDL.Null,
  });
  const InitArg = IDL.Record({
    'ethereum_network' : IDL.Opt(EthereumNetwork),
    'ecdsa_key_name' : IDL.Opt(EcdsaKeyName),
  });
  return [IDL.Opt(InitArg)];
};
