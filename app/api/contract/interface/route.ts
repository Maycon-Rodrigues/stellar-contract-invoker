import { xdr } from "@stellar/stellar-sdk";
import { StrKey } from "@stellar/stellar-base";
import { Server } from "@stellar/stellar-sdk/rpc";
import { parseContractMetadata } from "@stellar-expert/contract-wasm-interface-parser";

type ContractInterfaceRequest = {
  contractId: string;
  network: string;
};

// --- Funções Auxiliares (Movidas para fora do POST) ---

async function fetchContractInfo(
  contractId: string,
  network: string
): Promise<any> {
  // Retornará 'any' (metadados ou erro)
  let analysisResult: any = {
    error: "Contract information not found or Wasm analysis failed.",
  }; // Default error
  try {
    const server = new Server(
      network === "testnet"
        ? "https://soroban-testnet.stellar.org"
        : "https://soroban.stellar.org"
    );

    // console.log(
    //   `Buscando informações do contrato: ${contractId} na rede ${network}`
    // );

    if (!StrKey.isValidContract(contractId)) {
      throw new Error("Contract ID inválido.");
    }
    const contractIdBytes = StrKey.decodeContract(contractId);

    const instanceKey = xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        contract: xdr.ScAddress.scAddressTypeContract(contractIdBytes),
        key: xdr.ScVal.scvLedgerKeyContractInstance(),
        durability: xdr.ContractDataDurability.persistent(),
      })
    );

    // console.log("Buscando entradas do Ledger para a instância...");
    const ledgerEntries = await server.getLedgerEntries(instanceKey);

    // console.log(
    //   "Resposta completa de getLedgerEntries:",
    //   JSON.stringify(ledgerEntries, null, 2)
    // );

    if (
      ledgerEntries &&
      ledgerEntries.entries &&
      ledgerEntries.entries.length > 0
    ) {
      // console.log(`Encontradas ${ledgerEntries.entries.length} entradas.`);

      for (const entry of ledgerEntries.entries) {
        // console.log("Processando entrada:", JSON.stringify(entry, null, 2));

        try {
          // Revertendo para a lógica original (que funciona) com type assertion
          const entryVal = entry.val as any;
          if (
            entryVal &&
            entryVal._arm === "contractData" &&
            entryVal._value &&
            entryVal._value._attributes &&
            entryVal._value._attributes.val &&
            entryVal._value._attributes.val._arm === "instance" &&
            entryVal._value._attributes.val._value &&
            entryVal._value._attributes.val._value._attributes &&
            entryVal._value._attributes.val._value._attributes.executable &&
            entryVal._value._attributes.val._value._attributes.executable
              ._arm === "wasmHash" &&
            entryVal._value._attributes.val._value._attributes.executable._value
          ) {
            const wasmHashBuffer =
              entryVal._value._attributes.val._value._attributes.executable
                ._value;
            // const wasmHashHex = wasmHashBuffer.toString("hex");

            // console.log(`\n===== Informações da Instância do Contrato =====`);
            // console.log(
            //   `Hash Wasm associado (extraído diretamente): ${wasmHashHex}`
            // );

            const wasmBuffer = await fetchWasmBuffer(server, wasmHashBuffer);
            if (wasmBuffer) {
              analysisResult = analyzeWasm(wasmBuffer); // Captura o resultado (metadados ou erro)
              break; // Assume que encontramos a entrada relevante e saímos do loop
            } else {
              analysisResult = {
                error: "Wasm code not found for the extracted hash.",
              };
              break;
            }
          } else {
            // console.log(
            //  "Não foi possível extrair o wasmHash pela estrutura esperada."
            // );
            // Continua o loop caso esta não seja a entrada correta, mas mantenha um erro se nada for encontrado
            analysisResult = {
              error: "Wasm hash not found in contract instance data.",
            };
          }
        } catch (extractError: any) {
          // console.error(
          //   "Erro ao tentar extrair wasmHash diretamente:",
          //   extractError
          // );
          analysisResult = {
            error: "Error extracting Wasm hash from instance data.",
            details: extractError,
          };
          break; // Sai do loop em caso de erro na extração
        }
      }
    } else {
      // console.log(
      //   "Nenhuma entrada do Ledger encontrada para a instância do contrato."
      // );
      analysisResult = {
        error: "No ledger entries found for the contract instance.",
      };
    }
  } catch (error: any) {
    // console.error("\nErro ao buscar informações do contrato:", error);
    // if (error.response && error.response.data) {
    //   console.log(
    //     "Detalhes do erro RPC:",
    //     JSON.stringify(error.response.data, null, 2)
    //   );
    // } else if (error.message) {
    //   console.log("Mensagem de erro:", error.message);
    // }
    analysisResult = {
      error: "Failed to fetch contract info.",
      details: error instanceof Error ? error.message : String(error),
    };
  }
  return analysisResult; // Retorna o resultado da análise ou um objeto de erro
}

async function fetchWasmBuffer(
  server: any,
  wasmHash: Buffer
): Promise<Buffer | null> {
  try {
    // console.log(
    //   `\nBuscando código Wasm para o hash: ${wasmHash.toString("hex")}`
    // );
    const codeKey = xdr.LedgerKey.contractCode(
      new xdr.LedgerKeyContractCode({ hash: wasmHash })
    );
    const codeEntries = await server.getLedgerEntries(codeKey);

    if (codeEntries?.entries?.length > 0) {
      const codeEntry = codeEntries.entries[0];
      // console.log(
      //   "Processando entrada de código:",
      //   JSON.stringify(codeEntry, null, 2)
      // );

      try {
        // Revertendo para a lógica original (que funciona) com type assertion
        const codeEntryVal = codeEntry.val as any;
        if (
          codeEntryVal &&
          codeEntryVal._arm === "contractCode" &&
          codeEntryVal._value &&
          codeEntryVal._value._attributes &&
          codeEntryVal._value._attributes.code
        ) {
          const wasmCodeBuffer = codeEntryVal._value._attributes.code;
          // console.log(
          //   `Código Wasm encontrado (${wasmCodeBuffer.length} bytes).`
          // );
          return wasmCodeBuffer;
        } else {
          // console.log(
          //   "Não foi possível extrair o código Wasm pela estrutura esperada."
          // );
        }
      } catch (extractError: any) {
        // console.error(
        //   "Erro ao tentar extrair código Wasm diretamente:",
        //   extractError
        // );
      }
    } else {
      // console.log("Nenhuma entrada do Ledger encontrada para o código Wasm.");
    }
  } catch (error: any) {
    // console.error(
    //   `Erro ao buscar Wasm para o hash ${wasmHash.toString("hex")}:`,
    //   error
    // );
  }
  return null;
}

function analyzeWasm(wasmBuffer: Buffer): any {
  // Retorna 'any' (metadados ou erro)
  // console.log("\n===== Análise da Interface Wasm =====");
  try {
    const parsedMetadata = parseContractMetadata(wasmBuffer);
    // console.log("\n===== Metadados Parseados (Bruto) =====");
    // console.log(JSON.stringify(parsedMetadata, null, 2));
    // console.log("=======================================\n");
    return parsedMetadata; // Retorna diretamente os metadados brutos

    /* Lógica de formatação removida
    let output = "";
    // ... (código de formatação comentado ou removido)
    console.log("\n===== Interface Formatada =====");
    console.log(output);
    */
  } catch (parseError: any) {
    // console.error("Erro ao analisar o Wasm:", parseError);
    return { error: "Failed to parse Wasm metadata.", details: parseError }; // Retorna um objeto de erro
  }
}

// --- Rota POST ---

export async function POST(req: Request) {
  try {
    const { contractId, network } =
      (await req.json()) as ContractInterfaceRequest;

    // Chamar a função principal que agora retorna o resultado
    const result = await fetchContractInfo(contractId, network);

    // Determina o status baseado no resultado
    const status = result && result.error ? 500 : 200;

    // Retornar o resultado (metadados ou erro) no corpo da resposta
    return new Response(
      JSON.stringify({ data: result }), // Coloca o resultado sob a chave 'data'
      {
        status: status, // Usa o status determinado
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    // console.error("Erro na rota /api/interface:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        error: "Falha ao processar a requisição da interface do contrato.",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
