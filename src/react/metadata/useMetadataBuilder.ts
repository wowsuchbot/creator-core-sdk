/**
 * React hook for building NFT metadata with validation
 */

import { useState, useCallback, useMemo } from 'react';
import { MetadataBuilder } from '../../metadata/builder';
import type {
  ERC721Metadata,
  ERC1155Metadata,
  MetadataValidationResult,
  MetadataTemplate,
} from '../../metadata/types';

export interface UseMetadataBuilderOptions {
  /** Initial template to use */
  template?: MetadataTemplate;
  /** Initial name */
  name?: string;
  /** Initial image URI */
  imageUri?: string;
  /** Template options */
  templateOptions?: Record<string, string>;
}

export interface UseMetadataBuilderReturn {
  /** The metadata builder instance */
  builder: MetadataBuilder;
  /** Current metadata (partial until built) */
  metadata: Partial<ERC721Metadata | ERC1155Metadata>;
  /** Validate current metadata */
  validate: () => MetadataValidationResult;
  /** Build final metadata (throws if invalid) */
  build: () => ERC721Metadata | ERC1155Metadata;
  /** Reset builder to initial state */
  reset: () => void;
  /** Validation errors (empty if valid) */
  errors: MetadataValidationResult['errors'];
  /** Whether metadata is currently valid */
  isValid: boolean;
}

/**
 * Hook for building NFT metadata with real-time validation
 * 
 * @example
 * ```typescript
 * const { builder, validate, build, isValid, errors } = useMetadataBuilder({
 *   template: 'pfp',
 *   name: 'Cool NFT #1',
 *   imageUri: 'ipfs://...'
 * });
 * 
 * // Add attributes
 * builder.addAttribute('Rarity', 'Legendary');
 * 
 * // Validate
 * const validation = validate();
 * 
 * // Build when ready
 * if (isValid) {
 *   const metadata = build();
 * }
 * ```
 */
export function useMetadataBuilder(
  options: UseMetadataBuilderOptions = {}
): UseMetadataBuilderReturn {
  // Create initial builder
  const createBuilder = useCallback((): MetadataBuilder => {
    const { template, name, imageUri, templateOptions } = options;
    
    if (template && name && imageUri) {
      return MetadataBuilder.fromTemplate(template, name, imageUri, templateOptions);
    } else if (name && imageUri) {
      return new MetadataBuilder().setName(name).setImage(imageUri);
    }
    
    return new MetadataBuilder();
  }, [options.template, options.name, options.imageUri, options.templateOptions]);

  const [builder] = useState<MetadataBuilder>(createBuilder);
  const [updateCounter, setUpdateCounter] = useState(0);

  // Force re-render after builder modifications
  const forceUpdate = useCallback(() => {
    setUpdateCounter((c) => c + 1);
  }, []);

  // Get current metadata snapshot
  const metadata = useMemo(() => {
    try {
      // Try to build without throwing
      return builder.build();
    } catch {
      // Return partial metadata if build fails
      return builder['metadata'] as Partial<ERC721Metadata | ERC1155Metadata>;
    }
  }, [builder, updateCounter]);

  // Validate current state
  const validate = useCallback((): MetadataValidationResult => {
    forceUpdate();
    return builder.validate();
  }, [builder, forceUpdate]);

  // Build final metadata
  const build = useCallback((): ERC721Metadata | ERC1155Metadata => {
    const result = builder.build();
    forceUpdate();
    return result;
  }, [builder, forceUpdate]);

  // Reset builder
  const reset = useCallback(() => {
    builder.reset();
    forceUpdate();
  }, [builder, forceUpdate]);

  // Current validation state
  const validationResult = useMemo(() => builder.validate(), [builder, updateCounter]);

  return {
    builder,
    metadata,
    validate,
    build,
    reset,
    errors: validationResult.errors,
    isValid: validationResult.valid,
  };
}
