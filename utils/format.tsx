import { Tooltip } from "@heroui/react";
import { formatAddress } from "./tools";
import { isAgentAddress, isYouAddress } from "@/components/thread/utils";
import { ethers } from "ethers";
import { chain } from "./chain";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface AddressViewFormatProps {
  address: string;
  bracket?: boolean;
}

export function AddressViewFormat({
  address,
  bracket = true,
}: AddressViewFormatProps) {
  return (
    <Tooltip content={address}>
      <span className="text-gray-500 text-xs font-light">
        {bracket ? `(${formatAddress(address)})` : formatAddress(address)}
      </span>
    </Tooltip>
  );
}

interface NamedAddressViewProps {
  address: string;
  name: string;
}

export function NamedAddressView({ address, name }: NamedAddressViewProps) {
  return (
    <div className="space-x-2">
      <span className="font-semibold text-md">{name}</span>
      <AddressViewFormat address={address} />
    </div>
  );
}

interface UserAddressViewProps {
  agentPubkey: string;
  address: string;
}

export function UserAddressView({
  agentPubkey,
  address,
}: UserAddressViewProps) {
  return isAgentAddress(agentPubkey, address) ? (
    <NamedAddressView address={address} name="Agent" />
  ) : isYouAddress(address) ? (
    <NamedAddressView address={address} name="You" />
  ) : (
    <AddressViewFormat address={address} bracket={false} />
  );
}

export const VIEW_UNIT = chain === "sol" ? "SOL" : chain === "bsc" ? "BNB" : "";

export function formatReadableAmount(amount: string): string {
  if (chain === "sol") {
    return (Number(amount) / LAMPORTS_PER_SOL).toString();
  } else {
    return ethers.formatEther(amount);
  }
}
