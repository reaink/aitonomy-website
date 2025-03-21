import { WalletId } from "./id";
import { OkxConnect } from "./okx";
import { PhantomConnect } from "./phantom";
import { MetamaskConnect } from "./metamask";
import { OkxAppConnect } from "./okxApp";

export function getWalletConnect(walletId: WalletId) {
  switch (walletId) {
    case WalletId.OKX:
      return new OkxConnect();
    case WalletId.OKX_APP:
      return new OkxAppConnect();
    case WalletId.PHANTOM:
      return new PhantomConnect();
    case WalletId.METAMASK:
      return new MetamaskConnect();
    default:
      throw new Error(`Unknown wallet: ${walletId}`);
  }
}
