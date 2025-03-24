// This needs to be run client-side only
// Client-side private key access through localStorage or Next.js config
export const getWalletAddress = (): string => {
  // In a real app, use more secure methods for private key storage
  if (typeof window !== 'undefined') {
    try {
      // Check if we have an address cached in localStorage
      const cachedAddress = localStorage.getItem('walletAddress');
      if (cachedAddress) {
        return cachedAddress;
      }

      // For demo purposes, using hardcoded address
      // In production, you'd use a proper wallet connection method
      const address = "0xd5f91e397f816bc6826fd9f2e4fd3453d43ba9f418dbd65e5d4db51e0e7a92fd";
      localStorage.setItem('walletAddress', address);
      return address;
    } catch (error) {
      console.error("Failed to get wallet address:", error);
      return '';
    }
  }
  return '';
}; 