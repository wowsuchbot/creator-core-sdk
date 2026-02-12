import { useReadContract, useReadContracts } from 'wagmi';
import type { Address } from 'viem';
import ERC721CreatorABI from '../../abis/ERC721Creator.json';

/**
 * Configuration for reading contract data
 */
export interface CreatorContractConfig {
  contractAddress: Address;
  enabled?: boolean;
}

/**
 * Contract metadata information
 */
export interface ContractMetadata {
  name: string;
  symbol: string;
  totalSupply: bigint;
}

/**
 * Token ownership information
 */
export interface TokenOwnership {
  owner: Address;
  balance: bigint;
}

/**
 * Return type for useCreatorContract hook
 */
export interface UseCreatorContractReturn {
  // Metadata
  name: string | undefined;
  symbol: string | undefined;
  totalSupply: bigint | undefined;
  metadata: ContractMetadata | undefined;
  
  // Loading states
  isLoadingMetadata: boolean;
  isErrorMetadata: boolean;
  
  // Functions to fetch specific data
  getTokenURI: (tokenId: bigint) => Promise<string | undefined>;
  getBalanceOf: (owner: Address) => Promise<bigint | undefined>;
  getOwnerOf: (tokenId: bigint) => Promise<Address | undefined>;
  
  // Refetch function
  refetchMetadata: () => void;
}

/**
 * React hook for reading Creator contract state with full type safety
 * 
 * @example
 * ```tsx
 * const { 
 *   name, 
 *   symbol, 
 *   totalSupply, 
 *   metadata,
 *   isLoadingMetadata,
 *   getTokenURI,
 *   getBalanceOf,
 *   getOwnerOf 
 * } = useCreatorContract({ 
 *   contractAddress: "0x..." 
 * });
 * 
 * // Display contract info
 * console.log(`${name} (${symbol}) - Total Supply: ${totalSupply}`);
 * 
 * // Get token URI
 * const uri = await getTokenURI(1n);
 * console.log("Token URI:", uri);
 * 
 * // Get balance
 * const balance = await getBalanceOf("0x...");
 * console.log("Balance:", balance);
 * 
 * // Get owner
 * const owner = await getOwnerOf(1n);
 * console.log("Owner:", owner);
 * ```
 */
export function useCreatorContract(
  config: CreatorContractConfig
): UseCreatorContractReturn {
  const { contractAddress, enabled = true } = config;

  // Read multiple contract values at once for efficiency
  const { data, isLoading, isError, refetch } = useReadContracts({
    contracts: [
      {
        address: contractAddress,
        abi: ERC721CreatorABI,
        functionName: 'name',
      },
      {
        address: contractAddress,
        abi: ERC721CreatorABI,
        functionName: 'symbol',
      },
      {
        address: contractAddress,
        abi: ERC721CreatorABI,
        functionName: 'totalSupply',
      },
    ],
    query: {
      enabled,
    },
  });

  // Extract values from the batch read
  const name = data?.[0]?.result as string | undefined;
  const symbol = data?.[1]?.result as string | undefined;
  const totalSupply = data?.[2]?.result as bigint | undefined;

  // Combine into metadata object
  const metadata: ContractMetadata | undefined =
    name && symbol && totalSupply !== undefined
      ? { name, symbol, totalSupply }
      : undefined;

  // Individual read functions using useReadContract
  const getTokenURI = async (tokenId: bigint): Promise<string | undefined> => {
    try {
      const { data: uri } = await useReadContract({
        address: contractAddress,
        abi: ERC721CreatorABI,
        functionName: 'tokenURI',
        args: [tokenId],
      });
      return uri as string | undefined;
    } catch (error) {
      console.error('Error fetching token URI:', error);
      return undefined;
    }
  };

  const getBalanceOf = async (owner: Address): Promise<bigint | undefined> => {
    try {
      const { data: balance } = await useReadContract({
        address: contractAddress,
        abi: ERC721CreatorABI,
        functionName: 'balanceOf',
        args: [owner],
      });
      return balance as bigint | undefined;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return undefined;
    }
  };

  const getOwnerOf = async (tokenId: bigint): Promise<Address | undefined> => {
    try {
      const { data: owner } = await useReadContract({
        address: contractAddress,
        abi: ERC721CreatorABI,
        functionName: 'ownerOf',
        args: [tokenId],
      });
      return owner as Address | undefined;
    } catch (error) {
      console.error('Error fetching owner:', error);
      return undefined;
    }
  };

  const refetchMetadata = () => {
    refetch();
  };

  return {
    // Metadata
    name,
    symbol,
    totalSupply,
    metadata,
    
    // Loading states
    isLoadingMetadata: isLoading,
    isErrorMetadata: isError,
    
    // Functions
    getTokenURI,
    getBalanceOf,
    getOwnerOf,
    
    // Refetch
    refetchMetadata,
  };
}

/**
 * Hook for reading a specific token's URI
 */
export function useTokenURI(contractAddress: Address, tokenId: bigint) {
  const { data, isLoading, isError, refetch } = useReadContract({
    address: contractAddress,
    abi: ERC721CreatorABI,
    functionName: 'tokenURI',
    args: [tokenId],
  });

  return {
    uri: data as string | undefined,
    isLoading,
    isError,
    refetch,
  };
}

/**
 * Hook for reading an address's balance
 */
export function useBalanceOf(contractAddress: Address, owner: Address) {
  const { data, isLoading, isError, refetch } = useReadContract({
    address: contractAddress,
    abi: ERC721CreatorABI,
    functionName: 'balanceOf',
    args: [owner],
  });

  return {
    balance: data as bigint | undefined,
    isLoading,
    isError,
    refetch,
  };
}

/**
 * Hook for reading a token's owner
 */
export function useOwnerOf(contractAddress: Address, tokenId: bigint) {
  const { data, isLoading, isError, refetch } = useReadContract({
    address: contractAddress,
    abi: ERC721CreatorABI,
    functionName: 'ownerOf',
    args: [tokenId],
  });

  return {
    owner: data as Address | undefined,
    isLoading,
    isError,
    refetch,
  };
}
