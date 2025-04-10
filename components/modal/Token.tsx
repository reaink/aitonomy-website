"use client";

import { formatAddress, getAddressLink } from "@/utils/tools";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Avatar,
  Tooltip,
} from "@heroui/react";
import Link from "next/link";

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: any;
}

export default function TokenModal({
  isOpen,
  onClose,
  community,
}: TokenModalProps) {
  if (!community) return;

  const tokenInfo = [
    {
      label: "Token Contract",
      value: community.token_info?.contract,
      type: "address",
    },
    {
      label: "Agent Contract",
      value: community.agent_contract,
      type: "address",
    },
    {
      label: "Decimals",
      value: community.token_info?.decimals,
    },
    {
      label: "Issuance",
      value: community.token_info?.total_issuance
        ? Number(community.token_info?.total_issuance).toLocaleString()
        : "0",
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        body: "max-h-[85vh] overflow-y-auto md:max-h-[95vh]",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="text-lg font-semibold">
              {community.name} Token
            </ModalHeader>
            <ModalBody>
              <div className="flex justify-between py-4">
                <div className="flex flex-col justify-center items-center w-1/2">
                  <Avatar
                    src={community?.token_info?.image}
                    name={community?.token_info?.symbol}
                  />
                  <div className="flex items-center mt-1 space-x-1 text-md">
                    <span className="text-sm">
                      {community?.token_info?.symbol}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 text-sm text-zinc-300">
                  {tokenInfo.map((it) => (
                    <div className="flex" key={it.label}>
                      <span className="mr-1 font-semibold">{it.label}:</span>
                      {it?.type === "address" ? (
                        <Tooltip content={it.value} placement="right">
                          <Link href={getAddressLink(it.value)} target="_blank">
                            {formatAddress(it.value)}
                          </Link>
                        </Tooltip>
                      ) : (
                        it.value
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
