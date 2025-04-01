"use server";

import uploadImageWithPostImages from "@/lib/uploadImage";
import {
  ActivateCommunityArg,
  activateCommunityRpc,
  checkInviteRpc,
  CreateCommentArg,
  createCommentRpc,
  CreateCommunityArg,
  createCommunityRpc,
  CreateThreadArg,
  createThreadRpc,
  GenerateInviteCodeArg,
  generateInvitesCodesRpc,
  getAccountInfoRpc,
  getAccountsRpc,
  GetBalancesResponse,
  getBalancesRpc,
  getCommunityRpc,
  getInviteFeeRpc,
  GetRewardsResponse,
  getRewardsRpc,
  invitecodeAmountRpc,
  InviteUserArg,
  inviteUserRpc,
  SetAliasArg,
  setAliasRpc,
} from "@/utils/aitonomy";
import { Signature } from "@/utils/aitonomy/sign";
import { NUCLEUS_ID } from "@/utils/aitonomy/tools";
import { CHAIN } from "@/utils/chain";
import { hexToBytes } from "@/utils/tools";
import { CommunityMode, LLmName } from "@verisense-network/vemodel-types";
import bs58 from "bs58";
import { ethers } from "ethers";

if (!NUCLEUS_ID) {
  throw new Error("Nucleus ID is not defined");
}

export async function uploadImage(file: File) {
  try {
    const res = await uploadImageWithPostImages(file);
    return {
      success: true,
      data: res,
    };
  } catch (e: any) {
    console.error("uploadImage error", e);
    return {
      success: false,
      message: e.message,
    };
  }
}

export interface CreateCommunityForm {
  name: string;
  mode: {
    name: keyof CommunityMode;
    value: number | null;
  };
  logo: string;
  slug: string;
  description: string;
  prompt: string;
  token: {
    name: string;
    symbol: string;
    total_issuance: number;
    decimals: number;
    new_issue: boolean;
    contract: string | null;
    image: string | null;
  };
  llm_name: LLmName;
  llm_api_host: string | null;
  llm_key: string | null;
}

export async function createCommunity(
  form: CreateCommunityArg,
  signature: Signature
) {
  try {
    const communityArgs = form;

    const res = await createCommunityRpc(NUCLEUS_ID, communityArgs, signature);

    return {
      success: true,
      data: res,
    };
  } catch (e: any) {
    console.error("createCommunity error", e);
    return {
      success: false,
      message: e.message,
    };
  }
}

export interface CreateThreadForm {
  community: string;
  title: string;
  content: string;
  images: string[];
  mention: string[];
}

export async function createThread(
  form: CreateThreadArg,
  signature: Signature
) {
  try {
    const threadArgs = form;

    const res = await createThreadRpc(NUCLEUS_ID, threadArgs, signature);

    return {
      success: true,
      data: res,
    };
  } catch (e: any) {
    console.error("createThread error", e);
    return {
      success: false,
      message: e.message,
    };
  }
}

export async function createComment(
  form: CreateCommentArg,
  signature: Signature
) {
  try {
    const commentArgs = form;

    const res = await createCommentRpc(NUCLEUS_ID, commentArgs, signature);

    return {
      success: true,
      data: res,
    };
  } catch (e: any) {
    console.error("createComment error", e);
    return {
      success: false,
      message: e.message,
    };
  }
}

export async function activateCommunity(data: ActivateCommunityArg) {
  try {
    const threadArgs = data;

    const res = await activateCommunityRpc(NUCLEUS_ID, threadArgs);

    return {
      success: true,
      data: res,
    };
  } catch (e: any) {
    console.error("activateCommunity error", e);
    return {
      success: false,
      message: e.message,
    };
  }
}

interface GetAccountInfoParams {
  accountId: string;
}

export async function getAccountInfo(data: GetAccountInfoParams) {
  try {
    let accountId: Uint8Array = new Uint8Array();

    if (!data.accountId) {
      return {
        success: false,
        message: "Account ID is required",
      };
    }

    if (CHAIN === "BSC") {
      accountId = ethers.toBeArray(data.accountId);
    } else if (CHAIN === "SOL") {
      accountId = bs58.decode(data.accountId);
    }
    const threadArgs = {
      account_id: accountId,
    };

    const res = await getAccountInfoRpc(NUCLEUS_ID, threadArgs);

    return {
      success: true,
      data: res,
    };
  } catch (e: any) {
    console.error("getAccountInfo error", e);
    return {
      success: false,
      message: e.message,
    };
  }
}

interface GetAccountsParams {
  accountIds: string[];
}

export async function getAccounts(data: GetAccountsParams) {
  try {
    const accountIds = data.accountIds.map((id) => {
      if (CHAIN === "BSC") {
        return ethers.toBeArray(id);
      } else if (CHAIN === "SOL") {
        return bs58.decode(id);
      }
      return new Uint8Array();
    });
    const threadArgs = {
      account_ids: accountIds,
    };

    const res = await getAccountsRpc(NUCLEUS_ID, threadArgs);

    return {
      success: true,
      data: res,
    };
  } catch (e: any) {
    console.error("getAccounts error", e);
    return {
      success: false,
      message: e.message,
    };
  }
}

interface GetBalancesParams {
  accountId: string;
  gt?: string;
  limit: number;
}

export async function getBalances(data: GetBalancesParams) {
  try {
    let accountId: Uint8Array = new Uint8Array();
    if (!data.accountId) {
      return {
        success: true,
        data: [] as GetBalancesResponse[],
      };
    }
    if (CHAIN === "BSC") {
      accountId = ethers.toBeArray(data.accountId);
    } else if (CHAIN === "SOL") {
      accountId = bs58.decode(data.accountId);
    }
    const threadArgs = {
      account_id: accountId,
      gt: data.gt ? hexToBytes(data.gt) : undefined,
      limit: data.limit,
    };

    const res = await getBalancesRpc(NUCLEUS_ID, threadArgs);

    return {
      success: true,
      data: res,
    };
  } catch (e: any) {
    console.error("getBalances error", e);
    return {
      success: false,
      message: e.message,
    };
  }
}

interface GetRewardsParams {
  communityId: string;
  accountId: string;
}

export async function getRewards(data: GetRewardsParams) {
  try {
    let accountId: Uint8Array = new Uint8Array();
    if (!data.accountId || !data.communityId) {
      return {
        success: true,
        data: [] as GetRewardsResponse[],
      };
    }
    if (CHAIN === "BSC") {
      accountId = ethers.toBeArray(data.accountId);
    } else if (CHAIN === "SOL") {
      accountId = bs58.decode(data.accountId);
    }
    const threadArgs = {
      account_id: accountId,
      community_id: hexToBytes(data.communityId),
    };

    const res = await getRewardsRpc(NUCLEUS_ID, threadArgs);

    return {
      success: true,
      data: res,
    };
  } catch (e: any) {
    console.error("getRewards error", e);
    return {
      success: false,
      message: e.message,
    };
  }
}

export async function setAlias(data: SetAliasArg, signature: Signature) {
  try {
    const args = data;
    const res = await setAliasRpc(NUCLEUS_ID, args, signature);

    return {
      success: true,
      data: res,
    };
  } catch (e: any) {
    console.error("setAlias error", e);
    return {
      success: false,
      message: e.message,
    };
  }
}

export async function getCommunity(id: string) {
  try {
    const res = await getCommunityRpc(NUCLEUS_ID, { id: hexToBytes(id) });

    return {
      success: true,
      data: res,
    };
  } catch (e: any) {
    console.error("getCommunity error", e);
    return {
      success: false,
      message: e.message,
    };
  }
}

export async function inviteUser(data: InviteUserArg, signature: Signature) {
  try {
    const args = data;
    const res = await inviteUserRpc(NUCLEUS_ID, args, signature);

    return {
      success: true,
      data: res,
    };
  } catch (e: any) {
    console.error("getCommunity error", e);
    return {
      success: false,
      message: e.message,
    };
  }
}

export async function getInviteFee() {
  try {
    const args = "";
    const res = await getInviteFeeRpc(NUCLEUS_ID, args);
    return {
      success: true,
      data: res,
    };
  } catch (e: any) {
    console.error("getCommunity error", e);
    return {
      success: false,
      message: e.message,
    };
  }
}

interface CheckInviteParams {
  accountId: string;
  communityId: string;
}

export async function checkInvite(data: CheckInviteParams) {
  try {
    let accountId: Uint8Array = new Uint8Array();
    if (CHAIN === "BSC") {
      accountId = ethers.toBeArray(data.accountId);
    } else if (CHAIN === "SOL") {
      accountId = bs58.decode(data.accountId);
    }

    const args = {
      account_id: accountId,
      community_id: hexToBytes(data.communityId),
    };

    const res = await checkInviteRpc(NUCLEUS_ID, args);

    return {
      success: true,
      data: res,
    };
  } catch (e: any) {
    console.error("getBalances error", e);
    return {
      success: false,
      message: e.message,
    };
  }
}

export async function generateInviteCodes(
  data: GenerateInviteCodeArg,
  signature: Signature
) {
  try {
    const args = data;
    const res = await generateInvitesCodesRpc(NUCLEUS_ID, args, signature);

    return {
      success: true,
      data: res,
    };
  } catch (e: any) {
    console.error("getCommunity error", e);
    return {
      success: false,
      message: e.message,
    };
  }
}

interface InvitecodeAmountParams {
  accountId: string;
  communityId: string;
}

export async function invitecodeAmount(data: InvitecodeAmountParams) {
  try {
    let accountId: Uint8Array = new Uint8Array();
    if (CHAIN === "BSC") {
      accountId = ethers.toBeArray(data.accountId);
    } else if (CHAIN === "SOL") {
      accountId = bs58.decode(data.accountId);
    }

    const args = {
      account_id: accountId,
      community_id: hexToBytes(data.communityId),
    };

    const res = await invitecodeAmountRpc(NUCLEUS_ID, args);

    return {
      success: true,
      data: res,
    };
  } catch (e: any) {
    console.error("getBalances error", e);
    return {
      success: false,
      message: e.message,
    };
  }
}
