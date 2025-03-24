import { Account, Ed25519PrivateKey, PrivateKey, PrivateKeyVariants } from "@aptos-labs/ts-sdk";

export const getWalletAddress = (): string => {
  try {
    // Try to get private key from environment
    const privateKeyStr = process.env.NEXT_PUBLIC_APTOS_PRIVATE_KEY || '';
    
    if (!privateKeyStr) {
      console.log('No private key found in environment');
      return '';
    }
    
    // Create private key and account
    const privateKey = new Ed25519PrivateKey(
      PrivateKey.formatPrivateKey(
        privateKeyStr,
        PrivateKeyVariants.Ed25519
      )
    );
    
    const account = Account.fromPrivateKey({ privateKey });
    
    // Return the account address as string
    return account.accountAddress.toString();
  } catch (error) {
    console.error("Failed to get wallet address:", error);
    return '';
  }
}; 