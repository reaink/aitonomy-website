import { Controller, useForm } from "react-hook-form";
import { GenerateInviteCodeArg } from "@/utils/aitonomy";
import { useCallback, useEffect } from "react";
import { Button, Form, Input, NumberInput } from "@heroui/react";
import { ethers } from "ethers";
import { twMerge } from "tailwind-merge";
import { toast } from "react-toastify";
import { generateInviteCodes } from "@/app/actions";
import { signPayload } from "@/utils/aitonomy/sign";
import { GenerateInviteCodePayload } from "@verisense-network/vemodel-types";
import { WalletIcon } from "lucide-react";
import { sleep } from "@/utils/tools";

interface InviteUserFormProps {
  community: any;
  invitecodeAmount: number;
  setIsOpenPaymentModal: (isOpen: boolean) => void;
  paymentFee: string;
  txHash: string;
  setPaymentAmount: (amount: string) => void;
  refreshInvitecodeAmount: () => Promise<void>;
}

export default function BuyInviteCodeForm({
  community,
  invitecodeAmount,
  setIsOpenPaymentModal,
  paymentFee,
  txHash,
  setPaymentAmount,
  refreshInvitecodeAmount,
}: InviteUserFormProps) {
  const { control, setValue, watch, handleSubmit } = useForm<
    GenerateInviteCodeArg & { amount: number }
  >({
    defaultValues: {
      community: community?.name || "",
      tx: "",
      amount: 1,
    },
  });

  const amount = watch("amount");

  useEffect(() => {
    if (!amount || Number.isNaN(Number(amount))) {
      return;
    }
    setPaymentAmount(`${BigInt(amount) * BigInt(paymentFee)}`);
  }, [amount, paymentFee, setPaymentAmount]);

  useEffect(() => {
    setValue("tx", txHash);
  }, [txHash, setValue]);

  const onSubmit = useCallback(
    async (data: any) => {
      const payload = {
        community: data.community,
        tx: ` ${data.tx}`,
      };
      console.log("payload", payload);
      const signature = await signPayload(payload, GenerateInviteCodePayload);
      console.log("signature", signature);

      const { success, message: errorMessage } = await generateInviteCodes(
        payload,
        signature
      );
      if (!success) {
        toast.error(`Failed: ${errorMessage}`);
        return;
      }
      await sleep(2000);
      await refreshInvitecodeAmount();
      toast.success("Successfully generated invite code");
    },
    [refreshInvitecodeAmount]
  );

  const openPaymentModal = useCallback(() => {
    if (!amount || Number.isNaN(Number(amount))) {
      handleSubmit(onSubmit)();
      toast.error("Invalid amount");
      return;
    }

    setIsOpenPaymentModal(true);
  }, [amount, setIsOpenPaymentModal, handleSubmit, onSubmit]);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full pb-2">
        <p className="text-small">Invite code amount: {invitecodeAmount}</p>
      </div>
      <Controller
        name="amount"
        control={control}
        rules={{
          required: "Amount is required",
          validate: (value) => {
            if (!Number.isInteger(Number(value))) {
              return "Invalid amount";
            }
            if (Number(value) < 1) {
              return `Amount cannot be less than 1`;
            }
            if (Number(value) > 1000000) {
              return `Amount cannot be greater than 1000000`;
            }
            return true;
          },
        }}
        render={({ field, fieldState }) => (
          <div
            className={twMerge(
              "flex space-x-2 w-full",
              !!fieldState.error ? "items-center" : "items-end"
            )}
          >
            <NumberInput
              label="Number"
              labelPlacement="outside"
              placeholder="amount"
              isInvalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              value={field.value}
              defaultValue={field.value}
              onValueChange={field.onChange}
              maxValue={1000000}
              minValue={1}
              isRequired
            />
          </div>
        )}
      />
      <Controller
        name="tx"
        control={control}
        rules={{
          required: "Transaction hash is required",
          validate: (value) => {
            if (!ethers.isHexString(value)) {
              return "Invalid tx hash";
            }
            return true;
          },
        }}
        render={({ field, fieldState }) => (
          <div
            className={twMerge(
              "flex space-x-2 w-full",
              !!fieldState.error ? "items-center" : "items-end"
            )}
          >
            <Input
              {...field}
              className="w-3/4"
              label="Transaction"
              labelPlacement="outside"
              placeholder="Enter your tx or to payment"
              isInvalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
            />
            <Button onPress={openPaymentModal}>
              <WalletIcon className="w-6 h-6" />
              Payment
            </Button>
          </div>
        )}
      />
      <div className="flex gap-2">
        <Button color="primary" type="submit">
          Submit
        </Button>
        <Button type="reset" variant="flat">
          Reset
        </Button>
      </div>
    </Form>
  );
}
