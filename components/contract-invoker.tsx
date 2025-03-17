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
import { X, Plus } from "lucide-react";
import { Loader2 } from "lucide-react";
import { invokeContract } from "@/lib/stellar/invoke";
import { parameterTypes, type ParameterType } from "@/lib/parameter-types";
import JsonView from '@uiw/react-json-view';
import { lightTheme } from '@uiw/react-json-view/light';
import { vscodeTheme } from '@uiw/react-json-view/vscode';
import { useTheme } from "next-themes";
import { formatResult } from "@/lib/utils";
import { useWalletStore } from "@/store/wallet";
import { useHistoryStore } from "@/store/history";

const formSchema = z.object({
  contractId: z.string().min(1, "Contract ID is required"),
  functionName: z.string().min(1, "Function name is required"),
  parameters: z.string().optional(),
});

interface KeyValue {
  key: string;
  value: string;
}

export function ContractInvoker() {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<object>();
  const [keyValues, setKeyValues] = useState<KeyValue[]>([]);
  const { networkPassphrase } = useWalletStore();
  const { addHistory } = useHistoryStore();

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
    const params = newKeyValues.map(({ key, value }) => ({ key, value }));
    form.setValue("parameters", JSON.stringify(params, null, 2));
  };

  async function onSubmit({ contractId, functionName, parameters }: z.infer<typeof formSchema>) {
    try {
      const parsedParams = JSON.parse(parameters || "[]");
      const response = await invokeContract(
        contractId,
        functionName,
        parsedParams,
        networkPassphrase,
        setIsLoading
      );

      if (response?.error) {
        console.log(response.error.toString());

        // Create an object with error details
        const errorResponse = {
          status: "FAILURE",
          function: functionName,
          message: response.error.toString(),
          timestamp: new Date().toISOString(),
        };

        // Update state
        setResponse(errorResponse);

        // Add error details to history
        addHistory({
          contractId,
          functionName,
          networkPassphrase,
          parameters: parsedParams,
          timestamp: new Date().toISOString(),
          status: "FAILURE",
          response: errorResponse
        });

        toast({
          title: "Error",
          description: "Failed to execute contract function",
          variant: "destructive",
        });

        return;
      }

      let successResponse;

      if (response?.result === null && response?.status === "SUCCESS") {
        successResponse = {
          status: response?.status,
          function: response?.functionName,
          timestamp: new Date().toISOString(),
        };
      } else if (response?.status === "SUCCESS") {
        successResponse = {
          status: response?.status,
          function: response?.functionName,
          result: formatResult(response?.result),
          timestamp: new Date().toISOString(),
        };
      }

      // Update state
      setResponse(successResponse);

      // Add history
      addHistory({
        contractId,
        functionName,
        networkPassphrase,
        parameters: parsedParams,
        timestamp: new Date().toISOString(),
        status: response?.status || "SUCCESS",
        response: successResponse
      });

      toast({
        title: "Success",
        description: "Contract function executed successfully",
      });

    } catch (error: any) {
      // Response with error
      const errorResponse = {
        status: "FAILURE",
        message: error.message.toString(),
        timestamp: new Date().toISOString(),
      };

      setResponse(errorResponse);

      // Add error details to history
      addHistory({
        contractId,
        functionName,
        networkPassphrase,
        parameters: JSON.parse(parameters || "[]"),
        timestamp: new Date().toISOString(),
        status: "FAILURE",
        response: errorResponse
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
