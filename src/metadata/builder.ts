/**
 * Metadata builder utility with fluent API and validation
 * Provides type-safe construction of ERC721/ERC1155 metadata
 */

import type {
  ERC721Metadata,
  ERC1155Metadata,
  MetadataAttribute,
  MetadataValidationResult,
  MetadataValidationError,
  MetadataTemplate,
} from './types';

/**
 * Fluent builder for creating NFT metadata with validation
 * 
 * @example
 * ```typescript
 * const metadata = new MetadataBuilder()
 *   .setName('Cool NFT #1')
 *   .setDescription('A very cool NFT')
 *   .setImage('ipfs://...')
 *   .addAttribute('Rarity', 'Legendary')
 *   .build();
 * ```
 */
export class MetadataBuilder {
  private metadata: Partial<ERC721Metadata> = {};
  private attributes: MetadataAttribute[] = [];
  private isERC1155 = false;

  /**
   * Set the NFT name
   */
  setName(name: string): this {
    this.metadata.name = name;
    return this;
  }

  /**
   * Set the NFT description
   */
  setDescription(description: string): this {
    this.metadata.description = description;
    return this;
  }

  /**
   * Set the NFT image URI
   */
  setImage(image: string): this {
    this.metadata.image = image;
    return this;
  }

  /**
   * Add a metadata attribute/trait
   */
  addAttribute(
    trait_type: string,
    value: string | number,
    display_type?: string,
    max_value?: number
  ): this {
    const attribute: MetadataAttribute = {
      trait_type,
      value,
    };

    if (display_type !== undefined) {
      attribute.display_type = display_type;
    }

    if (max_value !== undefined) {
      attribute.max_value = max_value;
    }

    this.attributes.push(attribute);
    return this;
  }

  /**
   * Set external URL for the NFT
   */
  setExternalUrl(url: string): this {
    this.metadata.external_url = url;
    return this;
  }

  /**
   * Set animation/video URL
   */
  setAnimationUrl(url: string): this {
    this.metadata.animation_url = url;
    return this;
  }

  /**
   * Set background color (6-character hex without #)
   */
  setBackgroundColor(color: string): this {
    // Validate hex color format
    if (!/^[0-9A-Fa-f]{6}$/.test(color)) {
      throw new Error('Background color must be a 6-character hex string without #');
    }
    this.metadata.background_color = color;
    return this;
  }

  /**
   * Set YouTube video URL
   */
  setYoutubeUrl(url: string): this {
    this.metadata.youtube_url = url;
    return this;
  }

  /**
   * Enable ERC1155 mode (adds decimals and properties support)
   */
  asERC1155(decimals = 0): this {
    this.isERC1155 = true;
    (this.metadata as ERC1155Metadata).decimals = decimals;
    return this;
  }

  /**
   * Set custom properties for ERC1155
   */
  setProperties(properties: Record<string, unknown>): this {
    if (this.isERC1155) {
      (this.metadata as ERC1155Metadata).properties = properties;
    }
    return this;
  }

  /**
   * Validate the current metadata
   * Returns validation result with any errors found
   */
  validate(): MetadataValidationResult {
    const errors: MetadataValidationError[] = [];

    // Required fields
    if (!this.metadata.name || this.metadata.name.trim() === '') {
      errors.push({
        field: 'name',
        message: 'Name is required',
        rule: 'required',
      });
    }

    if (!this.metadata.description || this.metadata.description.trim() === '') {
      errors.push({
        field: 'description',
        message: 'Description is required',
        rule: 'required',
      });
    }

    if (!this.metadata.image || this.metadata.image.trim() === '') {
      errors.push({
        field: 'image',
        message: 'Image URI is required',
        rule: 'required',
      });
    }

    // Validate image URI format
    if (this.metadata.image) {
      const validPrefixes = ['ipfs://', 'https://', 'http://', 'data:', 'ar://'];
      const hasValidPrefix = validPrefixes.some((prefix) =>
        this.metadata.image!.startsWith(prefix)
      );
      if (!hasValidPrefix) {
        errors.push({
          field: 'image',
          message: 'Image URI must start with ipfs://, https://, http://, data:, or ar://',
          rule: 'format',
        });
      }
    }

    // Validate external_url if present
    if (this.metadata.external_url) {
      try {
        new URL(this.metadata.external_url);
      } catch {
        errors.push({
          field: 'external_url',
          message: 'External URL must be a valid URL',
          rule: 'format',
        });
      }
    }

    // Validate animation_url if present
    if (this.metadata.animation_url) {
      const validPrefixes = ['ipfs://', 'https://', 'http://', 'ar://'];
      const hasValidPrefix = validPrefixes.some((prefix) =>
        this.metadata.animation_url!.startsWith(prefix)
      );
      if (!hasValidPrefix) {
        errors.push({
          field: 'animation_url',
          message: 'Animation URL must start with ipfs://, https://, http://, or ar://',
          rule: 'format',
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Build and return the metadata object
   * Throws if validation fails
   */
  build(): ERC721Metadata | ERC1155Metadata {
    const validation = this.validate();
    if (!validation.valid) {
      const errorMessages = validation.errors
        .map((e) => `${e.field}: ${e.message}`)
        .join(', ');
      throw new Error(`Metadata validation failed: ${errorMessages}`);
    }

    const result = { ...this.metadata } as ERC721Metadata | ERC1155Metadata;

    // Add attributes if any were added
    if (this.attributes.length > 0) {
      result.attributes = this.attributes;
    }

    return result;
  }

  /**
   * Reset the builder to initial state
   */
  reset(): this {
    this.metadata = {};
    this.attributes = [];
    this.isERC1155 = false;
    return this;
  }

  /**
   * Create a generic NFT metadata template
   */
  static createGeneric(name: string, description: string, imageUri: string): MetadataBuilder {
    return new MetadataBuilder()
      .setName(name)
      .setDescription(description)
      .setImage(imageUri);
  }

  /**
   * Create a PFP (Profile Picture) NFT template with common traits
   */
  static createPFP(name: string, imageUri: string): MetadataBuilder {
    return new MetadataBuilder()
      .setName(name)
      .setDescription(`${name} is a unique PFP NFT from this collection`)
      .setImage(imageUri);
  }

  /**
   * Create an art NFT template
   */
  static createArt(
    title: string,
    artist: string,
    description: string,
    imageUri: string
  ): MetadataBuilder {
    return new MetadataBuilder()
      .setName(title)
      .setDescription(description)
      .setImage(imageUri)
      .addAttribute('Artist', artist)
      .addAttribute('Type', 'Digital Art');
  }

  /**
   * Create a gaming NFT template
   */
  static createGaming(
    name: string,
    description: string,
    imageUri: string,
    rarity: string
  ): MetadataBuilder {
    return new MetadataBuilder()
      .setName(name)
      .setDescription(description)
      .setImage(imageUri)
      .addAttribute('Rarity', rarity)
      .addAttribute('Type', 'Gaming Asset');
  }

  /**
   * Create a music NFT template
   */
  static createMusic(
    title: string,
    artist: string,
    audioUri: string,
    coverImageUri: string
  ): MetadataBuilder {
    return new MetadataBuilder()
      .setName(title)
      .setDescription(`${title} by ${artist}`)
      .setImage(coverImageUri)
      .setAnimationUrl(audioUri)
      .addAttribute('Artist', artist)
      .addAttribute('Type', 'Music');
  }

  /**
   * Create a builder from a template type
   */
  static fromTemplate(
    template: MetadataTemplate,
    name: string,
    imageUri: string,
    options: Record<string, string> = {}
  ): MetadataBuilder {
    switch (template) {
      case 'generic':
        return MetadataBuilder.createGeneric(
          name,
          options.description || `${name} NFT`,
          imageUri
        );
      case 'pfp':
        return MetadataBuilder.createPFP(name, imageUri);
      case 'art':
        return MetadataBuilder.createArt(
          name,
          options.artist || 'Unknown Artist',
          options.description || 'Digital artwork',
          imageUri
        );
      case 'gaming':
        return MetadataBuilder.createGaming(
          name,
          options.description || 'Gaming asset',
          imageUri,
          options.rarity || 'Common'
        );
      case 'music':
        return MetadataBuilder.createMusic(
          name,
          options.artist || 'Unknown Artist',
          options.audioUri || imageUri,
          imageUri
        );
      default:
        return new MetadataBuilder().setName(name).setImage(imageUri);
    }
  }
}

/**
 * Validate metadata object without using builder
 */
export function validateMetadata(
  metadata: Partial<ERC721Metadata | ERC1155Metadata>
): MetadataValidationResult {
  const builder = new MetadataBuilder();
  builder['metadata'] = metadata;
  if (metadata.attributes) {
    builder['attributes'] = metadata.attributes;
  }
  return builder.validate();
}
