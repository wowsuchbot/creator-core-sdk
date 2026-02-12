/**
 * Tests for MetadataBuilder
 */

import { describe, it, expect } from 'vitest';
import { MetadataBuilder, validateMetadata } from '../builder';
import type { ERC721Metadata } from '../types';

describe('MetadataBuilder', () => {
  describe('Basic Building', () => {
    it('should build valid ERC721 metadata', () => {
      const metadata = new MetadataBuilder()
        .setName('Test NFT')
        .setDescription('A test NFT')
        .setImage('ipfs://QmTest123')
        .build();

      expect(metadata.name).toBe('Test NFT');
      expect(metadata.description).toBe('A test NFT');
      expect(metadata.image).toBe('ipfs://QmTest123');
    });

    it('should add attributes correctly', () => {
      const metadata = new MetadataBuilder()
        .setName('Test NFT')
        .setDescription('A test NFT')
        .setImage('ipfs://QmTest123')
        .addAttribute('Rarity', 'Legendary')
        .addAttribute('Power', 100, 'number')
        .build();

      expect(metadata.attributes).toHaveLength(2);
      expect(metadata.attributes?.[0]).toEqual({
        trait_type: 'Rarity',
        value: 'Legendary',
      });
      expect(metadata.attributes?.[1]).toEqual({
        trait_type: 'Power',
        value: 100,
        display_type: 'number',
      });
    });

    it('should support fluent API chaining', () => {
      const builder = new MetadataBuilder();
      const result = builder
        .setName('Test')
        .setDescription('Desc')
        .setImage('ipfs://test');

      expect(result).toBe(builder);
    });
  });

  describe('Validation', () => {
    it('should require name', () => {
      const builder = new MetadataBuilder()
        .setDescription('Test')
        .setImage('ipfs://test');

      const validation = builder.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0].field).toBe('name');
    });

    it('should require description', () => {
      const builder = new MetadataBuilder()
        .setName('Test')
        .setImage('ipfs://test');

      const validation = builder.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors[0].field).toBe('description');
    });

    it('should require image', () => {
      const builder = new MetadataBuilder()
        .setName('Test')
        .setDescription('Test description');

      const validation = builder.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors[0].field).toBe('image');
    });

    it('should validate image URI format', () => {
      const builder = new MetadataBuilder()
        .setName('Test')
        .setDescription('Test')
        .setImage('invalid-uri');

      const validation = builder.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.field === 'image' && e.rule === 'format')).toBe(true);
    });

    it('should accept valid URI prefixes', () => {
      const validPrefixes = ['ipfs://', 'https://', 'http://', 'data:', 'ar://'];

      validPrefixes.forEach(prefix => {
        const builder = new MetadataBuilder()
          .setName('Test')
          .setDescription('Test')
          .setImage(`${prefix}test`);

        const validation = builder.validate();
        expect(validation.valid).toBe(true);
      });
    });

    it('should throw on invalid build', () => {
      const builder = new MetadataBuilder().setName('Test');

      expect(() => builder.build()).toThrow('Metadata validation failed');
    });
  });

  describe('Optional Fields', () => {
    it('should set external URL', () => {
      const metadata = new MetadataBuilder()
        .setName('Test')
        .setDescription('Test')
        .setImage('ipfs://test')
        .setExternalUrl('https://example.com')
        .build();

      expect(metadata.external_url).toBe('https://example.com');
    });

    it('should set animation URL', () => {
      const metadata = new MetadataBuilder()
        .setName('Test')
        .setDescription('Test')
        .setImage('ipfs://test')
        .setAnimationUrl('ipfs://animation')
        .build();

      expect(metadata.animation_url).toBe('ipfs://animation');
    });

    it('should set background color', () => {
      const metadata = new MetadataBuilder()
        .setName('Test')
        .setDescription('Test')
        .setImage('ipfs://test')
        .setBackgroundColor('FF0000')
        .build();

      expect(metadata.background_color).toBe('FF0000');
    });

    it('should validate background color format', () => {
      const builder = new MetadataBuilder();

      expect(() => builder.setBackgroundColor('#FF0000')).toThrow();
      expect(() => builder.setBackgroundColor('FF00')).toThrow();
      expect(() => builder.setBackgroundColor('ZZZZZZ')).toThrow();
    });
  });

  describe('Templates', () => {
    it('should create generic template', () => {
      const metadata = MetadataBuilder.createGeneric(
        'Test NFT',
        'A test',
        'ipfs://test'
      ).build();

      expect(metadata.name).toBe('Test NFT');
      expect(metadata.description).toBe('A test');
      expect(metadata.image).toBe('ipfs://test');
    });

    it('should create PFP template', () => {
      const metadata = MetadataBuilder.createPFP('Cool PFP #1', 'ipfs://test').build();

      expect(metadata.name).toBe('Cool PFP #1');
      expect(metadata.description).toContain('PFP NFT');
    });

    it('should create art template', () => {
      const metadata = MetadataBuilder.createArt(
        'Masterpiece',
        'Artist Name',
        'A beautiful artwork',
        'ipfs://test'
      ).build();

      expect(metadata.name).toBe('Masterpiece');
      expect(metadata.attributes?.some(a => a.trait_type === 'Artist')).toBe(true);
    });

    it('should create from template type', () => {
      const metadata = MetadataBuilder.fromTemplate(
        'pfp',
        'PFP #1',
        'ipfs://test'
      ).build();

      expect(metadata.name).toBe('PFP #1');
    });
  });

  describe('ERC1155 Support', () => {
    it('should enable ERC1155 mode', () => {
      const metadata = new MetadataBuilder()
        .setName('Test')
        .setDescription('Test')
        .setImage('ipfs://test')
        .asERC1155(18)
        .build();

      expect('decimals' in metadata).toBe(true);
      if ('decimals' in metadata) {
        expect(metadata.decimals).toBe(18);
      }
    });

    it('should set properties in ERC1155 mode', () => {
      const metadata = new MetadataBuilder()
        .setName('Test')
        .setDescription('Test')
        .setImage('ipfs://test')
        .asERC1155()
        .setProperties({ custom: 'value' })
        .build();

      if ('properties' in metadata) {
        expect(metadata.properties).toEqual({ custom: 'value' });
      }
    });
  });

  describe('Reset Functionality', () => {
    it('should reset builder state', () => {
      const builder = new MetadataBuilder()
        .setName('Test')
        .setDescription('Test')
        .setImage('ipfs://test')
        .addAttribute('Rarity', 'Common');

      builder.reset();

      const validation = builder.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateMetadata helper', () => {
    it('should validate complete metadata', () => {
      const metadata: ERC721Metadata = {
        name: 'Test',
        description: 'Test',
        image: 'ipfs://test',
      };

      const result = validateMetadata(metadata);
      expect(result.valid).toBe(true);
    });

    it('should detect invalid metadata', () => {
      const metadata = {
        name: 'Test',
        description: '',
        image: 'ipfs://test',
      };

      const result = validateMetadata(metadata);
      expect(result.valid).toBe(false);
    });
  });
});
