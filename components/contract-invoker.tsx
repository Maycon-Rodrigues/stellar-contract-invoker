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
import JsonView from "@uiw/react-json-view";
import { lightTheme } from "@uiw/react-json-view/light";
import { vscodeTheme } from "@uiw/react-json-view/vscode";
import { useTheme } from "next-themes";
import { formatResult } from "@/lib/utils";
import { useWalletStore } from "@/store/wallet";
import { useHistoryStore } from "@/store/history";
import { useExplorerStore } from "@/store/explorer";

// Interface definition for a contract function input
interface ContractFunctionInput {
  type: string;
  // The name is now the key in the 'inputs' object
}

// Interface definition for a contract function
interface ContractFunction {
  // The function name is now the key in the Record<>
  inputs: Record<string, ContractFunctionInput>; // Inputs is an object
  outputs: string[]; // Outputs is an array of strings (types)
}

const formSchema = z.object({
  contractId: z.string().min(1, "Contract ID is required"),
  functionName: z.string().min(1, "Function name is required"),
  parameters: z.string().optional(),
});

interface KeyValue {
  key: string; // The parameter type (e.g., "Address")
  value: string; // The value entered by the user
  // name?: string; // Optional: store the original parameter name
}

export function ContractInvoker() {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<object>();
  const [keyValues, setKeyValues] = useState<KeyValue[]>([]);
  const { networkPassphrase } = useWalletStore();
  const { addHistory } = useHistoryStore();
  const { initialData, setInitialData } = useExplorerStore();
  const [isLoadingInterface, setIsLoadingInterface] = useState<boolean>(false);
  // State holds a Record where the key is the function name
  const [contractInterface, setContractInterface] = useState<Record<
    string,
    ContractFunction
  > | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractId: "",
      functionName: "",
      parameters: "",
    },
  });

  // useEffect for initial data
  useEffect(() => {
    if (initialData) {
      form.setValue("contractId", initialData.contractId);
      form.setValue("functionName", initialData.functionName);

      const newKeyValues = initialData.parameters.map((param) => ({
        key: param.key,
        value: param.value,
      }));

      setKeyValues(newKeyValues);
      updateParametersJson(newKeyValues);

      setInitialData(null);
    }
  }, [initialData, form, setInitialData]);

  const addKeyValue = () => {
    // Adjust default type if necessary
    setKeyValues([...keyValues, { key: parameterTypes.STRING, value: "" }]);
  };

  const removeKeyValue = (index: number) => {
    const newKeyValues = keyValues.filter((_, i) => i !== index);
    setKeyValues(newKeyValues);
    updateParametersJson(newKeyValues);
  };

  const updateKeyValue = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newKeyValues = keyValues.map((kv, i) => {
      if (i === index) {
        return {
          ...kv,
          [field]: field === "key" ? (value as ParameterType) : value,
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

  async function onSubmit({
    contractId,
    functionName,
    parameters,
  }: z.infer<typeof formSchema>) {
    // onSubmit logic remains the same
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
          response: errorResponse,
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
        response: successResponse,
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
        response: errorResponse,
      });

      toast({
        title: "Error",
        description: "Failed to execute contract function",
        variant: "destructive",
      });
    }
  }

  async function handleFetchContractInterface() {
    const contractId = form.getValues("contractId");
    if (!contractId) {
      toast({
        title: "Error",
        description: "Please enter a Contract ID.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingInterface(true);
    setContractInterface(null);
    form.setValue("functionName", "");
    setKeyValues([]);
    updateParametersJson([]);

    try {
      const network = "testnet"; // Or get from config/state
      const response = await fetch("/api/contract/interface", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId, network }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to fetch interface: ${response.statusText}`
        );
      }

      const rawData = await response.json();

      // Extract 'functions' from within 'data' and type correctly
      const {
        data,
      }: { data: { functions: Record<string, ContractFunction> } } = rawData;
      const functions = data?.functions; // Access functions within data

      // Check if 'functions' exists and is not empty
      if (!functions || Object.keys(functions).length === 0) {
        toast({
          title: "Warning",
          description: "No functions found for this contract.",
          variant: "default",
        });
        setContractInterface({}); // Set as empty object to indicate loaded but no functions
      } else {
        setContractInterface(functions); // Store only the 'functions' object in state
        toast({
          title: "Success",
          description: "Contract interface loaded.",
        });
      }
    } catch (error: any) {
      setContractInterface(null); // Clear on error
      toast({
        title: "Error",
        description: error.message || "Could not load contract interface.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingInterface(false);
    }
  }

  // Function to handle function selection
  const handleFunctionChange = (functionName: string) => {
    form.setValue("functionName", functionName);

    // Access the function definition using the name as the key
    const selectedFunction = contractInterface?.[functionName];

    // Check if the function was found and has inputs
    if (
      selectedFunction?.inputs &&
      Object.keys(selectedFunction.inputs).length > 0
    ) {
      // Map the inputs (object) to the KeyValue format (array)
      const newKeyValues = Object.entries(selectedFunction.inputs).map(
        ([paramName, inputDef]) => ({
          // [paramName, { type: "address" }]
          key: mapApiTypeToParameterType(inputDef.type), // Map the type (e.g., "address" -> "Address")
          value: "", // Initial empty value
          // name: paramName // Optional: store original name
        })
      );
      setKeyValues(newKeyValues);
      updateParametersJson(newKeyValues);
    } else {
      // If the function has no parameters or wasn't found, clear parameters
      setKeyValues([]);
      updateParametersJson([]);
    }
  };

  // Helper function to map API types
  const mapApiTypeToParameterType = (apiType: string): ParameterType => {
    const lowerApiType = apiType.toLowerCase();
    // Try direct match (case-insensitive)
    const foundType = (Object.values(parameterTypes) as string[]).find(
      (paramType) => paramType.toLowerCase() === lowerApiType
    );

    if (foundType) {
      return foundType as ParameterType;
    }

    // --- Specific Mappings ---
    // Add mappings here if API names don't exactly match
    // `parameterTypes` names (ignoring case).
    // Examples:
    // if (lowerApiType === 'address') return parameterTypes.Address;
    // if (lowerApiType === 'uint32' || lowerApiType === 'u32') return parameterTypes.U32;
    // if (lowerApiType === 'int128' || lowerApiType === 'i128') return parameterTypes.I128;
    // if (lowerApiType === 'bytesn' || lowerApiType.startsWith('bytesn_')) return parameterTypes.BytesN; // More complex example

    return parameterTypes.STRING; // Return a safe default
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-end justify-between gap-2">
                <FormField
                  control={form.control}
                  name="contractId"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Contract ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contract ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  onClick={handleFetchContractInterface}
                  type="button"
                  className="h-10"
                  variant="outline"
                  size="sm"
                  disabled={isLoadingInterface}
                >
                  {isLoadingInterface ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Load Contract"
                  )}
                </Button>
              </div>

              {/* Conditional Function Name field */}
              {/* Check if contractInterface is not null and has keys */}
              {contractInterface &&
              Object.keys(contractInterface).length > 0 ? (
                <FormField
                  control={form.control}
                  name="functionName"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Function Name</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleFunctionChange(value);
                          }}
                          value={field.value || ""} // Controlled
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a function" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {/* Iterate over the keys (function names) */}
                            {Object.keys(contractInterface).map((funcName) => {
                              return (
                                <SelectItem key={funcName} value={funcName}>
                                  {/* Use the function name (the key) */}
                                  {funcName}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              ) : (
                // Fallback to Input
                <FormField
                  control={form.control}
                  name="functionName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Function Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter function name or load contract"
                          {...field}
                          disabled={
                            isLoadingInterface ||
                            (contractInterface !== null &&
                              Object.keys(contractInterface).length > 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Parameters Section (keyValues) */}
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
                  {/* Parameter rendering (KeyValue) remains the same */}
                  {keyValues.map((kv, index) => (
                    <div key={index} className="flex gap-3">
                      <Select
                        value={kv.key}
                        onValueChange={(value) =>
                          updateKeyValue(index, "key", value)
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(parameterTypes).map(
                            ([key, value]) => (
                              <SelectItem key={key} value={value}>
                                {value}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Value"
                        value={kv.value}
                        onChange={(e) =>
                          updateKeyValue(index, "value", e.target.value)
                        }
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

                {/* Generated JSON (Textarea) */}
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

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || isLoadingInterface}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Execute Function
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  form.reset();
                  setResponse({});
                  setKeyValues([]);
                  setContractInterface(null);
                  updateParametersJson([]);
                }}
              >
                Clear
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Response Card */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Response</h3>
          <div
            className={`bg-muted p-4 rounded-lg overflow-auto max-h-[400px] transition-opacity ${
              isLoading ? "opacity-50" : "opacity-100"
            }`}
            style={{
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
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
              <span className="text-sm text-muted-foreground">
                No response yet
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
