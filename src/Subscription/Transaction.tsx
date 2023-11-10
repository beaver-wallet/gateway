import { useEffect, useRef } from "react";
import {
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction,
} from "wagmi";

export function TransactionComponent(props: {
  txData: any;
  onSuccess: () => void;
  onError: () => void;
}) {
  const { config } = usePrepareSendTransaction(
    props.txData
  );
  const sendHook = useSendTransaction(config);
  const txHash = sendHook.data?.hash;
  const waitHook = useWaitForTransaction({
    hash: txHash,
  });

  const txInitiated = useRef(false);

  useEffect(() => {
    if (
      sendHook.sendTransaction &&
      !txInitiated.current
    ) {
      txInitiated.current = true;
      sendHook.sendTransaction();
    }
  }, [sendHook]);

  if (waitHook.isSuccess) {
    props.onSuccess();
    return <div />;
  }
  if (waitHook.error) {
    props.onError();
    return <div />;
  }
  if (waitHook.isLoading) {
    return <p>Waiting for execution</p>;
  }

  // If sendHook.isSuccess is true, then waitHook.isLoading becomes true immediately
  if (sendHook.error) {
    props.onError();
    return <div />;
  }
  if (sendHook.isLoading) {
    return (
      <p>Sign transaction in your wallet.</p>
    );
  }

  return <div />;
}
