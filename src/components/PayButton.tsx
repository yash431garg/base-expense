import { parseEther } from "viem";
import { useSendTransaction, useWaitForTransactionReceipt, useAccount, useChainId } from "wagmi";
import { useMiniApp } from '@neynar/react';
import { Button } from "./ui/Button";
import { truncateAddress } from "~/lib/truncateAddress";
import { BaseError, UserRejectedRequestError } from "viem";
import { base } from "wagmi/chains";

export function PaymentComponent({
    amount,
    address,
}: {
    amount: string;
    address: string;
}) {
    const { context } = useMiniApp();
    const { isConnected, address: walletAddress } = useAccount();
    const chainId = useChainId();
    
    // Debug logging
    console.log('PaymentComponent - context:', context);
    console.log('PaymentComponent - user fid:', context?.user?.fid);
    console.log('PaymentComponent - isConnected:', isConnected);
    console.log('PaymentComponent - walletAddress:', walletAddress);
    console.log('PaymentComponent - chainId:', chainId);
    console.log('PaymentComponent - base.id:', base.id);
    console.log('PaymentComponent - isDisabled:', !context?.user?.fid || !isConnected);
    
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

    const handlePayment = () => {
        const valueInWei = parseEther('0.00001');
        console.log('PaymentComponent - amount:', amount);
        console.log('PaymentComponent - valueInWei:', valueInWei.toString());
        console.log('PaymentComponent - valueInEth:', parseFloat(amount));
        
        sendTransaction({
            to: address as `0x${string}`,
            value: valueInWei,
        });
    };

    const renderError = (error: Error | null) => {
        if (!error) return null;
        if (error instanceof BaseError) {
            const isUserRejection = error.walk(
                (e) => e instanceof UserRejectedRequestError
            );

            if (isUserRejection) {
                return <div className="text-red-500 text-xs mt-1">Rejected by user.</div>;
            }
        }

        return <div className="text-red-500 text-xs mt-1">{error.message}</div>;
    };

    return (
        <>
            <Button
                onClick={handlePayment}
                disabled={!context?.user?.fid || !isConnected || isPending}
                isLoading={isPending}
                className="w-full mt-2"
            >
                Pay ${amount}
            </Button>
            {!isConnected && (
                <div className="text-yellow-500 text-xs mt-2">
                    Wallet not connected. Please connect your wallet in the Wallet tab.
                </div>
            )}
            {renderError(error)}
            {data && (
                <div className="mt-2 text-xs text-gray-300">
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


