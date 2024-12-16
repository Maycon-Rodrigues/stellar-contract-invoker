import { walletKit } from "./wallet";
import { rpc, TransactionBuilder, Operation, scValToNative, nativeToScVal } from "@stellar/stellar-sdk";
import { handleParameterType } from "../utils";
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit";


export const invokeContract = async (
  contractId: string,
  functionName: string,
  args: any,
  networkPassphrase: WalletNetwork,
  setLoading: (isLoading: boolean) => void
) => {

  const kit = walletKit(networkPassphrase);

  try {
    setLoading(true)

    const soroban_server = new rpc.Server("https://soroban-testnet.stellar.org:443");
    const address = await kit.getAddress();
    const account = await soroban_server.getAccount(address.address);
    // TODO: Validate if we'll use the network passphrase from the wallet
    // const { networkPassphrase } = await kit.getNetwork();

    // Create a transaction
    let transaction = new TransactionBuilder(account, { networkPassphrase, fee: "1000" })
      .setTimeout(300)
      .addOperation(Operation.invokeContractFunction({
        contract: contractId,
        function: functionName,
        args: handleParameterType(args)
      }))
      .build()

    // Prepare the transaction
    transaction = await soroban_server.prepareTransaction(transaction);
    // Convert the transaction to XDR
    const transactionXDR = transaction.toXDR();
    // Sign the transaction
    const signedTransactionXDR = await kit.signTransaction(transactionXDR, { address: address.address, networkPassphrase });
    // Convert the signed transaction back to a Stellar transaction
    const signedTransaction = TransactionBuilder.fromXDR(signedTransactionXDR.signedTxXdr, networkPassphrase);

    // Send the signed transaction
    const response = await soroban_server.sendTransaction(signedTransaction);

    // Wait for the transaction to be processed
    let get_transaction_data;
    while (true) {
      get_transaction_data = await soroban_server.getTransaction(response.hash);
      if (get_transaction_data.status !== "NOT_FOUND") {
        console.log("Status: ", get_transaction_data.status)
        break;
      }
    }

    if (get_transaction_data.status !== "SUCCESS") {
      console.log("Transaction failed", get_transaction_data.resultXdr)
      return null
    }

    // GET transaction Status
    const status = get_transaction_data.status
    // Convert transaction to xdr.ScVal
    const returnValue = nativeToScVal(get_transaction_data.resultMetaXdr.v3().sorobanMeta()?.returnValue());

    // Convert xdr.ScVal to readble result
    const result = scValToNative(returnValue);
    // const result = scValToNative(returnValue).toString();

    return { functionName, status, result }
  } catch (error) {
    // console.log("Error:::: ", error)
    return { error }
  } finally {
    setLoading(false)
  }
}
