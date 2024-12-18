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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { X, Plus, LucideNetwork } from "lucide-react";
import { Loader2 } from "lucide-react";
import { invokeContract } from "@/lib/stellar/invoke";
import { parameterTypes, type ParameterType } from "@/lib/parameter-types";
import JsonView from '@uiw/react-json-view';
import { lightTheme } from '@uiw/react-json-view/light';
import { vscodeTheme } from '@uiw/react-json-view/vscode';
import { useTheme } from "next-themes";
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit";

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
  network: WalletNetwork;
}

export function ContractInvoker({ network }: ContractInvokerProps) {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<object>();
  const [keyValues, setKeyValues] = useState<KeyValue[]>([]);

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
    setKeyValues([...keyValues, { key: 'String', value: "" }]);
  };

  const removeKeyValue = (index: number) => {
    const newKeyValues = keyValues.filter((_, i) => i !== index);
    setKeyValues(newKeyValues);
    updateParametersJson(newKeyValues);
  };

  const updateKeyValue = (index: number, field: "key" | "value", value: string) => {
    const newKeyValues = keyValues.map((kv, i) => {
      if (i === index) {
        return {
          ...kv,
          [field]: field === "key" ? value as ParameterType : value,
        };
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

  async function onSubmit({ contractId, functionName }: z.infer<typeof formSchema>) {
    // Here we would normally interact with the Stellar network
    try {
      const response = await invokeContract(
        contractId,
        functionName,
        [keyValues],
        network,
        setIsLoading
      );

      if (response?.error) {
        throw response.error;
      }

      if (response?.result === null && response?.status === "SUCCESS") {
        console.log("Status da UI: ", response?.status);
        setResponse({
          status: response?.status,
          function: response?.functionName,
          timestamp: new Date().toISOString()
        });

        toast({
          title: "Success",
          description: "Contract function executed successfully",
        });

        return
      }

      const result = response?.result.toString();

      if (response?.status === "SUCCESS") {
        setResponse({
          status: response?.status,
          function: response?.functionName,
          result,
          timestamp: new Date().toISOString()
        });

        toast({
          title: "Success",
          description: "Contract function executed successfully",
        });
      }
    } catch (error: any) {
      setResponse({
        status: "FAILURE",
        message: error.message,
        timestamp: new Date().toISOString()
      });

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
                      <Select
                        value={kv.key}
                        onValueChange={(value) => updateKeyValue(index, "key", value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(parameterTypes).map(([key, value]) => (
                            <SelectItem key={key} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
          <pre className={`bg-muted p-4 rounded-lg overflow-auto max-h-[400px] font-mono transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing request...</span>
              </div>
            ) : response ? (
              <JsonView
                value={response}
                style={
                  theme === "dark" || theme === "system"
                    ? vscodeTheme
                    : lightTheme
                }
                displayDataTypes={false}
                objectSortKeys={false}
              />
            ) : (
              "No response yet"
            )}
          </pre>
        </CardContent>
      </Card>
    </div >
  );
}
