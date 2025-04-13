import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type BlockTag = { 'Earliest' : null } |
  { 'Safe' : null } |
  { 'Finalized' : null } |
  { 'Latest' : null } |
  { 'Number' : bigint } |
  { 'Pending' : null };
export type EcdsaKeyName = { 'ProductionKey1' : null } |
  { 'TestKeyLocalDevelopment' : null } |
  { 'TestKey1' : null };
export type EthereumNetwork = { 'Mainnet' : null } |
  { 'Sepolia' : null };
export interface InitArg {
  'ethereum_network' : [] | [EthereumNetwork],
  'ecdsa_key_name' : [] | [EcdsaKeyName],
}
export type Wei = bigint;
export interface _SERVICE {
  'ethereum_address' : ActorMethod<[[] | [Principal]], string>,
  'get_balance' : ActorMethod<[[] | [string]], Wei>,
  'send_eth' : ActorMethod<[string, Wei], string>,
  'transaction_count' : ActorMethod<
    [[] | [Principal], [] | [BlockTag]],
    bigint
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
