"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { X, Plus } from "lucide-react";
import { WalletNetwork } from '@creit.tech/stellar-wallets-kit';
import { rpc, xdr, TransactionBuilder, Operation } from "@stellar/stellar-sdk"
import useStellarWalletsKit from "@/hooks/useStellarWalletKit";

const formSchema = z.object({
  contractId: z.string().min(1, "Contract ID is required"),
  functionName: z.string().min(1, "Function name is required"),
  parameters: z.string().optional(),
});

interface KeyValue {
  key: string;
  value: string;
}

interface ContractInvokerProps {
  network: string;
}

export function ContractInvoker({ network }: ContractInvokerProps) {
  const { toast } = useToast();
  const [response, setResponse] = useState<string>("");
  const [keyValues, setKeyValues] = useState<KeyValue[]>([]);
  const kit = useStellarWalletsKit();

  useEffect(() => {
    response
  }, [response])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractId: "",
      functionName: "",
      parameters: "",
    },
  });

  const addKeyValue = () => {
    setKeyValues([...keyValues, { key: "", value: "" }]);
  };

  const removeKeyValue = (index: number) => {
    const newKeyValues = keyValues.filter((_, i) => i !== index);
    setKeyValues(newKeyValues);
    updateParametersJson(newKeyValues);
  };

  const updateKeyValue = (index: number, field: "key" | "value", value: string) => {
    const newKeyValues = keyValues.map((kv, i) => {
      if (i === index) {
        return { ...kv, [field]: value };
      }
      return kv;
    });
    setKeyValues(newKeyValues);
    updateParametersJson(newKeyValues);
  };

  const updateParametersJson = (newKeyValues: KeyValue[]) => {
    const params = newKeyValues.reduce((acc, { key, value }) => {
      if (key) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);

    form.setValue("parameters", JSON.stringify(params, null, 2));
  };

  const invoke_contract = async (contractId: string, functionName: string, args: xdr.ScVal[]) => {
    try {
      const soroban_server = new rpc.Server("https://soroban-testnet.stellar.org:443");
      const address = await kit.getAddress();
      const account = await soroban_server.getAccount(address.address);


      // const scValArray = args
      //   ? args.map((arg) => xdr.ScVal.scvString(arg))
      //   : [];

      let transaction = new TransactionBuilder(account, { networkPassphrase: WalletNetwork.TESTNET, fee: "1000" })
        .setTimeout(300)
        .addOperation(Operation.invokeContractFunction({
          contract: contractId,
          function: functionName,
          args
        }))
        .build()

      // console.log("Transaction: ", transaction)


      transaction = await soroban_server.prepareTransaction(transaction);
      const transactionXDR = transaction.toXDR();
      const signedTransactionXDR = await kit.signTransaction(transactionXDR, { address: address.address, networkPassphrase: WalletNetwork.TESTNET });
      const signedTransaction = TransactionBuilder.fromXDR(signedTransactionXDR.signedTxXdr, WalletNetwork.TESTNET);

      const response = await soroban_server.sendTransaction(signedTransaction);

      // console.log("Response: ", response.hash)

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

      // console.log("Before transaction meta")
      // const transaction_meta = xdr.TransactionMeta.fromXDR(get_transaction_data.resultMetaXdr!, 'base64');
      // console.log(transaction_meta)
      const status = get_transaction_data.status
      const result = get_transaction_data.resultMetaXdr.v3().sorobanMeta()?.returnValue().value()?.toString()
      console.log("Result: ", result)

      return { functionName, status, result }
    } catch (error) {
      console.log("Error: ", error)
      toast({
        title: "Error",
        description: "Failed to invoke contract, verify your wallet network",
        variant: "destructive",
      });
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(keyValues);
      // Here we would normally interact with the Stellar network
      const response = await invoke_contract(values.contractId, values.functionName, []);
      // setResponse(JSON.stringify(response, null, 2));
      setResponse(JSON.stringify({
        status: response?.status,
        function: response?.functionName,
        result: response?.result,
        timestamp: new Date().toISOString(),
      }, null, 2));

      toast({
        title: "Success",
        description: "Contract function executed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute contract function",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="contractId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contract ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="functionName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Function Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter function name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Parameters</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addKeyValue}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Parameter
                  </Button>
                </div>

                <div className="space-y-3">
                  {keyValues.map((kv, index) => (
                    <div key={index} className="flex gap-3">
                      <Input
                        placeholder="Key"
                        value={kv.key}
                        onChange={(e) => updateKeyValue(index, "key", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Value"
                        value={kv.value}
                        onChange={(e) => updateKeyValue(index, "value", e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeKeyValue(index)}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <FormField
                  control={form.control}
                  name="parameters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Generated JSON</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Parameters will be generated here"
                          className="min-h-[100px] font-mono"
                          readOnly
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                Execute Function
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Response</h3>
          <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[400px] font-mono">
            {response || "No response yet"}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
