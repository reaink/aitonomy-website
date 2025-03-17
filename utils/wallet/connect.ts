import { useUserStore } from "@/stores/user";
import { getWalletConnect } from "./index";
import { addMetaMaskListener } from "../user";

export enum WalletId {
  OKX = "okx",
  PHANTOM = "phantom",
  METAMASK = "metamask",
}

export async function connectToWallet(walletId: WalletId) {
  const walletConnect = getWalletConnect(walletId);

  const msg = await walletConnect.connect();

  console.log("msg", msg, walletConnect);

  if (msg && !walletConnect.address) {
    throw msg;
  }

  const publicKey = walletConnect.publicKey;
  const address = walletConnect.address;

  const userStore = useUserStore.getState();
  const name = address.slice(0, 4);

  userStore.setUser({ name, publicKey, address });
  userStore.setWallet(walletId);

  addMetaMaskListener();

  return publicKey;
}
