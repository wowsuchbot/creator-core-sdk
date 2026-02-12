import {
  type Address,
  type PublicClient,
  type WalletClient,
  getContract,
} from 'viem';
import { ERC721Creator } from './clients/ERC721Creator';
import { getContractAddresses } from './constants';
import type { CreatorConfig, DeploymentResult, SDKConfig } from './types';
import ERC721CreatorFactoryABI from '../abis/ERC721CreatorFactory.json';

export class CreatorCoreSDK {
  private factoryAddress: Address;
  private chainId: number;

  constructor(
    private publicClient: PublicClient,
    private walletClient?: WalletClient,
    config?: SDKConfig
  ) {
    this.chainId = config?.chainId || publicClient.chain?.id || 1;
    this.factoryAddress =
      config?.factoryAddress || getContractAddresses(this.chainId).erc721CreatorFactory;
  }

  /**
   * Deploy a new ERC721Creator contract
   */
  async deployERC721(config: CreatorConfig): Promise<DeploymentResult> {
    if (!this.walletClient) {
      throw new Error('Wallet client required for deployment');
    }

    const account = this.walletClient.account;
    if (!account) {
      throw new Error('Wallet account not found');
    }

    const factory = getContract({
      address: this.factoryAddress,
      abi: ERC721CreatorFactoryABI,
      client: { public: this.publicClient, wallet: this.walletClient },
    });

    // Deploy the contract
    const hash = await factory.write.createCreator([config.name, config.symbol], {
      account,
    });

    // Wait for transaction receipt
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });

    // Extract deployed contract address from CreatorDeployed event
    const creatorDeployedLog = receipt.logs.find(
      (log) => log.topics[0] === factory.abi.find((item: any) => item.name === 'CreatorDeployed')?.signature
    );

    if (!creatorDeployedLog || !creatorDeployedLog.topics[1]) {
      throw new Error('Failed to extract deployed contract address from logs');
    }

    const contractAddress = `0x${creatorDeployedLog.topics[1].slice(26)}` as Address;

    return {
      contractAddress,
      transactionHash: hash,
      blockNumber: receipt.blockNumber,
    };
  }

  /**
   * Get an ERC721Creator client for an existing contract
   */
  getERC721Creator(address: Address): ERC721Creator {
    return new ERC721Creator(address, this.publicClient, this.walletClient);
  }

  /**
   * Get the factory address being used
   */
  getFactoryAddress(): Address {
    return this.factoryAddress;
  }

  /**
   * Get the chain ID
   */
  getChainId(): number {
    return this.chainId;
  }
}
