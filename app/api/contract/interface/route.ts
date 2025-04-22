import { fetchContractInfo } from "@/server/fetch-contract-info";

type ContractInterfaceRequest = {
  contractId: string;
  network: string;
};

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
