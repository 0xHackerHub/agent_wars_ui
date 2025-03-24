
import { AgentRuntime, LocalSigner, createAptosTools } from "move-agent-kit"
import { Aptos, AptosConfig, Ed25519PrivateKey, Network, PrivateKey, PrivateKeyVariants } from "@aptos-labs/ts-sdk"

export async function createAgentRuntime(): Promise<AgentRuntime> {
    const aptosConfig = new AptosConfig({
        network: Network.MAINNET,
    })

    const aptos = new Aptos(aptosConfig)

    // Validate and get private key from environment
    const privateKeyStr = process.env.APTOS_PRIVATE_KEY
    if (!privateKeyStr) {
        throw new Error("Missing APTOS_PRIVATE_KEY environment variable")
    }

    // Setup account and signer
    const account = await aptos.deriveAccountFromPrivateKey({
        privateKey: new Ed25519PrivateKey(PrivateKey.formatPrivateKey(privateKeyStr, PrivateKeyVariants.Ed25519)),
    })

    const signer = new LocalSigner(account, Network.MAINNET)
    const aptosAgent = new AgentRuntime(signer, aptos, {
        PANORA_API_KEY: process.env.PANORA_API_KEY,
    })
    return aptosAgent
}