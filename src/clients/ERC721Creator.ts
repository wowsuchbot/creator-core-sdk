import {
  type Address,
  type PublicClient,
  type WalletClient,
  type Hash,
  getContract,
} from 'viem';
import type { MintResult, MintBatchResult } from '../types';
import ERC721CreatorABI from '../../abis/ERC721Creator.json';

export class ERC721Creator {
  private contract;

  constructor(
    public readonly address: Address,
    private publicClient: PublicClient,
    private walletClient?: WalletClient
  ) {
    this.contract = getContract({
      address: this.address,
      abi: ERC721CreatorABI,
      client: { public: this.publicClient, wallet: this.walletClient },
    });
  }

  /**
   * Mint a single NFT to a recipient address
   */
  async mint(to: Address, uri?: string): Promise<MintResult> {
    if (!this.walletClient) {
      throw new Error('Wallet client required for minting');
    }

    const account = this.walletClient.account;
    if (!account) {
      throw new Error('Wallet account not found');
    }

    const hash = uri
      ? await this.contract.write.mintBase([to, uri], { account })
      : await this.contract.write.mintBase([to], { account });

    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });

    // Extract tokenId from logs
    const tokenId = BigInt(receipt.logs[0]?.topics[3] || '0');

    return {
      tokenId,
      transactionHash: hash,
    };
  }

  /**
   * Mint multiple NFTs to a recipient address
   */
  async mintBatch(
    to: Address,
    count?: number,
    uris?: string[]
  ): Promise<MintBatchResult> {
    if (!this.walletClient) {
      throw new Error('Wallet client required for minting');
    }

    const account = this.walletClient.account;
    if (!account) {
      throw new Error('Wallet account not found');
    }

    let hash: Hash;
    if (uris && uris.length > 0) {
      hash = await this.contract.write.mintBaseBatch([to, uris], { account });
    } else if (count) {
      hash = await this.contract.write.mintBaseBatch([to, count], { account });
    } else {
      throw new Error('Either count or uris must be provided');
    }

    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });

    // Extract tokenIds from logs
    const tokenIds = receipt.logs.map((log) => BigInt(log.topics[3] || '0'));

    return {
      tokenIds,
      transactionHash: hash,
    };
  }

  /**
   * Get the token URI for a specific token
   */
  async tokenURI(tokenId: bigint): Promise<string> {
    return (await this.contract.read.tokenURI([tokenId])) as string;
  }

  /**
   * Get the balance of an address
   */
  async balanceOf(owner: Address): Promise<bigint> {
    return (await this.contract.read.balanceOf([owner])) as bigint;
  }

  /**
   * Get the contract name
   */
  async name(): Promise<string> {
    return (await this.contract.read.name()) as string;
  }

  /**
   * Get the contract symbol
   */
  async symbol(): Promise<string> {
    return (await this.contract.read.symbol()) as string;
  }

  /**
   * Get the contract owner
   */
  async owner(): Promise<Address> {
    return (await this.contract.read.owner()) as Address;
  }
}
