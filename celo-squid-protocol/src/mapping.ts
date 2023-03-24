import { BigInt, log } from "@graphprotocol/graph-ts";
import {
  GasAdded,
  GasPaidForContractCall,
  GasPaidForContractCallWithToken,
  NativeGasAdded,
  NativeGasPaidForContractCall,
  NativeGasPaidForContractCallWithToken,
} from "../generated/AxelarGasService/AxelarGasService";
import { AddressStat, AddressStatByDate, TokenStat, TokenStatByDate, TokenStatByMonth } from "../generated/schema";

const SQUID_ROUTER_ADDRESS = "0xce16f69375520ab01377ce7b88f5ba8c48f8d666";

export function handleNativeGasPaidForContractCallWithToken(event: NativeGasPaidForContractCallWithToken): void {
  if(!event) {
    return;
  }

  // if it's not from squid
  if(event.params.sourceAddress.toHexString() != SQUID_ROUTER_ADDRESS) {
    return;
  }

  // have to separate cause the graph does not support aggregations
  let id = event.transaction.from.toHex() + "_" + event.params.destinationChain + "_" + event.params.symbol;
  let addressStat = AddressStat.load(id); // ID = user_address + symbol
  if(!addressStat) {
    addressStat = new AddressStat(id);
    addressStat.user_address = event.transaction.from.toHex();
    addressStat.sourceChain = "celo";
    addressStat.destinationChain = event.params.destinationChain;
    addressStat.volume = new BigInt(0);
    addressStat.symbol = event.params.symbol;
  }

  addressStat.volume = addressStat.volume.plus(event.params.amount);
  addressStat.save();

  let tokenStatId = event.params.destinationChain + "_" + event.params.symbol; // ID = destination chain + symbol
  let tokenStat = TokenStat.load(tokenStatId); // ID = symbol
  if(!tokenStat) {
    tokenStat = new TokenStat(tokenStatId);
    tokenStat.sourceChain = "celo";
    tokenStat.destinationChain = event.params.destinationChain;
    tokenStat.volume = new BigInt(0);
    tokenStat.symbol = event.params.symbol;
  }

  tokenStat.volume = tokenStat.volume.plus(event.params.amount);
  tokenStat.save();

  let date = new Date(event.block.timestamp.toI64() * 1000); // to milliseconds
  let y = date.getUTCFullYear().toString();
  let m = (date.getUTCMonth() + 1).toString();
  m = m.length < 2? '0' + m : m;
  let d = date.getUTCDate().toString();
  d = d.length < 2? '0' + d : d;

  let dateStr = y + '/' + m + '/' + d;
  let monthStr = y + '/' + m;
  
  let addressDateId = dateStr + "_" + event.transaction.from.toHex() + "_" + event.params.destinationChain + "_" + event.params.symbol;
  let addressStatByDate = AddressStatByDate.load(addressDateId);
  if(!addressStatByDate) {
    addressStatByDate = new AddressStatByDate(addressDateId);
    addressStatByDate.user_address = event.transaction.from.toHex();
    addressStatByDate.date = dateStr;
    addressStatByDate.sourceChain = "celo";
    addressStatByDate.destinationChain = event.params.destinationChain;
    addressStatByDate.symbol = event.params.symbol;
    addressStatByDate.volume = new BigInt(0);
  }

  addressStatByDate.volume = addressStatByDate.volume.plus(event.params.amount);
  addressStatByDate.save();

  let dateId = dateStr + "_" + event.params.destinationChain + "_" + event.params.symbol;
  let tokenStatsByDate = TokenStatByDate.load(dateId);
  if(!tokenStatsByDate) {
    tokenStatsByDate = new TokenStatByDate(dateId);
    tokenStatsByDate.date = dateStr;
    tokenStatsByDate.sourceChain = "celo";
    tokenStatsByDate.destinationChain = event.params.destinationChain;
    tokenStatsByDate.symbol = event.params.symbol;
    tokenStatsByDate.volume = new BigInt(0);
  }

  tokenStatsByDate.volume = tokenStatsByDate.volume.plus(event.params.amount);
  tokenStatsByDate.save();

  let monthId = monthStr + "_" + event.params.destinationChain + "_" + event.params.symbol;
  let tokenStatsByMonth = TokenStatByMonth.load(monthId);
  if(!tokenStatsByMonth) {
    tokenStatsByMonth = new TokenStatByMonth(monthId);
    tokenStatsByMonth.date = monthStr;
    tokenStatsByMonth.sourceChain = "celo";
    tokenStatsByMonth.destinationChain = event.params.destinationChain;
    tokenStatsByMonth.symbol = event.params.symbol;
    tokenStatsByMonth.volume = new BigInt(0);
  }

  tokenStatsByMonth.volume = tokenStatsByMonth.volume.plus(event.params.amount);
  tokenStatsByMonth.save();

  return;
}

// not used
export function handleGasAdded(event: GasAdded): void {
  return;
}

// not used
export function handleGasPaidForContractCall(event: GasPaidForContractCall): void {
  return;
}

// not used
export function handleGasPaidForContractCallWithToken(event: GasPaidForContractCallWithToken): void {
  return;
}

// not used
export function handleNativeGasAdded(event: NativeGasAdded): void {
  return;
}

// not used
export function handleNativeGasPaidForContractCall(event: NativeGasPaidForContractCall): void {
  return;
}