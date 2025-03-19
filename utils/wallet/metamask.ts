import {
  BrowserProvider,
  ethers,
  JsonRpcProvider,
  TransactionRequest,
} from "ethers";
import { MetaMaskSDK, SDKProvider } from "@metamask/sdk";
import { WalletId } from "./id";
import { useUserStore } from "@/stores/user";
import { isDev } from "../tools";

const bscNetworkId = "0x38";
export class MetamaskConnect {
  id = WalletId.METAMASK;
  wallet: SDKProvider | undefined;
  address: string = "";
  publicKey: Uint8Array = new Uint8Array(32);
  sdk = new MetaMaskSDK({
    dappMetadata: {
      name: "Aitonomy",
      url: window.location.origin,
    },
    injectProvider: true,
    infuraAPIKey: process.env.NEXT_PUBLIC_INFURA_API_KEY,
    useDeeplink: true,
    checkInstallationImmediately: true,
    i18nOptions: {
      enabled: true,
    },
    logging: {
      developerMode: isDev,
    },
    storage: {
      enabled: true,
    },
  });
  provider: BrowserProvider | null = null;
  jsonRpcProvider: JsonRpcProvider = new ethers.JsonRpcProvider(
    "https://bsc-dataseed1.binance.org/"
  );

  constructor() {
    this.checkStoredPublicKey();
  }

  async checkStoredPublicKey() {
    const userStore = useUserStore.getState();
    if (userStore.publicKey.length === 0) return;
    this.publicKey = new Uint8Array(Object.values(userStore.publicKey));
    this.address = userStore.address;
    await this.checkConnected();
  }

  async connect() {
    await this.checkConnected();
    const accounts = await this.sdk.connect();
    const publicKey = accounts[0];

    if (!publicKey) {
      throw new Error("account not found");
    }

    const signer = await this.provider!.getSigner();

    this.address = await signer.getAddress();
    this.publicKey = ethers.toBeArray(this.address);
    console.log("this.publicKey", this.publicKey);
    console.log("this.address", this.address);

    const chainId = this.wallet!.getChainId();

    if (chainId !== bscNetworkId) {
      try {
        await this.wallet!.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: bscNetworkId }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          const res = await this.wallet?.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: bscNetworkId,
                rpcUrls: ["https://bsc-dataseed.binance.org/"],
                chainName: "Binance Smart Chain",
                nativeCurrency: {
                  name: "BNB",
                  symbol: "BNB",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://bscscan.com"],
              },
            ],
          });
          console.log("add bsc chain", res);
        } else {
          throw switchError;
        }
      }
    }

    return this.publicKey;
  }

  async checkConnected() {
    try {
      if (!this.sdk.isInitialized()) {
        await this.sdk.init();
      }

      if (!this.wallet?.isConnected()) {
        await this.sdk.connect();
        this.wallet = this.sdk.getProvider();
      }

      if (!this.provider) {
        this.provider = new ethers.BrowserProvider(window.ethereum as any);
      }

      await this.switchChain();

      if (window.ethereum && window.ethereum?.isPhantom) {
        throw new Error(
          "Phantom Wallet extension already exists. Please disable Phantom extension first."
        );
      } else if (!window.ethereum) {
        throw new Error(
          "MetaMask extension not found. Please install it first."
        );
      }
    } catch (error: any) {
      console.error("Error checking connection:", error);
      if (error.code === -32002) {
        throw new Error("Click Continue to connect");
      } else {
        throw error;
      }
    }
  }

  async switchChain() {
    const chainId = this.wallet!.getChainId();

    if (chainId !== bscNetworkId) {
      await this.wallet!.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: bscNetworkId }],
      });
    }
  }

  async signMessage(message: string): Promise<Uint8Array> {
    await this.checkConnected();

    const encoded = new TextEncoder().encode(message);
    const hexMsg = ethers.hexlify(encoded);
    const signature = await this.wallet!.request({
      method: "personal_sign",
      params: [hexMsg, this.address],
    });
    if (!signature) {
      throw new Error("Signature not found");
    }
    return ethers.getBytes(signature as string);
  }

  async verifySignature(
    message: string,
    signature: Uint8Array,
    signer: Uint8Array
  ): Promise<boolean> {
    const sigStr = ethers.hexlify(signature);
    const signerAddress = ethers.verifyMessage(message, sigStr);
    const expectedAddress = ethers.hexlify(signer);
    const isValid =
      signerAddress.toLowerCase() === expectedAddress.toLowerCase();
    return isValid;
  }

  async createTransaction(
    toAddress: string,
    amount: string
  ): Promise<TransactionRequest> {
    const tx: TransactionRequest = {
      to: ethers.getAddress(toAddress),
      from: ethers.getAddress(this.address),
      value: ethers.parseUnits(amount, "ether").toString(16),
    };
    return tx;
  }

  async signTransaction(tx: TransactionRequest): Promise<string> {
    await this.checkConnected();

    const sig = await this.wallet!.request({
      method: "eth_sendTransaction",
      params: [tx],
    });

    return sig as string;
  }

  async broadcastTransaction(sigHash: string) {
    /**
     * BSC use sendTransaction broadcastTransaction
     */
    return sigHash;
  }

  async getFinalizedTransaction(txHash: string) {
    await this.checkConnected();
    const receipt = await this.jsonRpcProvider.waitForTransaction(txHash);
    return receipt;
  }
}
