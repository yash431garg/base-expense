import { parseEther } from "viem";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "./ui/Button";
import { truncateAddress } from "~/lib/truncateAddress";

export function PaymentComponent({
    amount,
    address,
}: {
    amount: string;
    address: string;
}) {
    const { isConnected } = useAccount();
    const {
        data,
        error,
        isPending,
        sendTransaction,
    } = useSendTransaction();
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash: data,
        });

    const handleBet = () => {
        sendTransaction({
            to: address,
            value: parseEther("0.0001"),
        });
    };

    return (
        <>
            <Button
                onClick={handleBet}
                disabled={!isConnected || isPending}
                isLoading={isPending}
                className="w-full mt-2"
            >
                pay
            </Button>
            {/* {renderError(error)} */}
            {data && (
                <div className="mt-2 text-xs">
                    <div>Hash: {truncateAddress(data)}</div>
                    <div>
                        Status:{" "}
                        {isConfirming
                            ? "Confirming..."
                            : isConfirmed
                                ? "Confirmed!"
                                : "Pending"}
                    </div>
                </div>
            )}
        </>
    );
}


