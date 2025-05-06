import { LogosRecipe } from '../../services/question-generation';
import { WikidataEntity } from '../../services/wikidata';
import { WikidataQueryBuilder } from '../../services/wikidata/query_builder';
import { Categories } from '../../services/wikidata/index';

describe('LogosRecipe', () => {
  let recipe: LogosRecipe;
  
  beforeEach(() => {
    recipe = new LogosRecipe();
  });
  
  describe('buildQuery', () => {
    it('should build appropriate query with clearProperties and instance', () => {
      const qb = new WikidataQueryBuilder();
      const spyClear = jest.spyOn(qb, 'clearProperties');
      const spyInstance = jest.spyOn(qb, 'instanceOf');
      const spyAssoc = jest.spyOn(qb, 'assocProperty');
      
      recipe.buildQuery(qb);
      
      expect(spyClear).toHaveBeenCalled();
      expect(spyInstance).toHaveBeenCalledWith(14073567);
      expect(spyAssoc).toHaveBeenCalledWith(18, "imagen", null, false);
      expect(spyAssoc).toHaveBeenCalledWith(154, "logo", null, true);
      expect(spyAssoc).toHaveBeenCalledWith(487, "symbol", null, true);
    });
  });
  
  describe('getImageUrl', () => {
    it('should return symbol value if available', () => {
      const binding = {
        symbolLabel: { value: 'https://example.com/symbol.jpg' },
        logoLabel: { value: 'https://example.com/logo.jpg' },
        imagen: { value: 'https://example.com/image.jpg' }
      };
      
      const result = recipe.getImageUrl(binding);
      expect(result).toBe('https://example.com/symbol.jpg');
    });
    
    it('should return logo value if symbol is not available', () => {
      const binding = {
        logoLabel: { value: 'https://example.com/logo.jpg' },
        imagen: { value: 'https://example.com/image.jpg' }
      };
      
      const result = recipe.getImageUrl(binding);
      expect(result).toBe('https://example.com/logo.jpg');
    });
    
    it('should return imagen value if symbol and logo are not available', () => {
      const binding = {
        imagen: { value: 'https://example.com/image.jpg' }
      };
      
      const result = recipe.getImageUrl(binding);
      expect(result).toBe('https://example.com/image.jpg');
    });
    
    it('should return empty string and log message if no images are available', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const binding = {
        itemLabel: { value: 'Test Entity' }
      };
      
      const result = recipe.getImageUrl(binding);
      
      expect(result).toBe('');
      expect(consoleSpy).toHaveBeenCalledWith('No image found for entity:', 'Test Entity');
      
      consoleSpy.mockRestore();
    });
    
    it('should handle entities with no label', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const binding = {};
      
      const result = recipe.getImageUrl(binding);
      
      expect(result).toBe('');
      expect(consoleSpy).toHaveBeenCalledWith('No image found for entity:', 'Unknown');
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('getAttributes', () => {
    it('should collect all available attributes', () => {
      const binding = {
        symbolLabel: { value: 'Symbol Value' },
        logoLabel: { value: 'Logo Value' },
        imagen: { value: 'Image URL' },
        itemLabel: { value: 'Company Name' }
      };
      
      const attributes = recipe.getAttributes(binding);
      
      expect(attributes).toHaveLength(4);
      expect(attributes).toContainEqual(['symbol', 'Symbol Value']);
      expect(attributes).toContainEqual(['logo', 'Logo Value']);
      expect(attributes).toContainEqual(['imagen', 'Image URL']);
      expect(attributes).toContainEqual(['item_label', 'Company Name']);
    });
    
    it('should handle missing attributes', () => {
      const binding = {
        imagen: { value: 'Image URL' },
        itemLabel: { value: 'Company Name' }
      };
      
      const attributes = recipe.getAttributes(binding);
      
      expect(attributes).toHaveLength(2);
      expect(attributes).toContainEqual(['imagen', 'Image URL']);
      expect(attributes).toContainEqual(['item_label', 'Company Name']);
    });
    
    it('should provide a placeholder when item label is missing', () => {
      const binding = {
        imagen: { value: 'Image URL' }
      };
      
      const attributes = recipe.getAttributes(binding);
      
      expect(attributes).toHaveLength(2);
      expect(attributes).toContainEqual(['imagen', 'Image URL']);
      expect(attributes).toContainEqual(['item_label', 'Entidad desconocida']);
    });
  });
  
  describe('generateQuestion', () => {
    it('should return a function that extracts item_label attribute', () => {
      const entity = new WikidataEntity('https://example.com/image')
        .addAttribute('item_label', 'Microsoft');
      
      const genFunc = recipe.generateQuestion();
      const result = genFunc(entity);
      
      expect(result).toBe('Microsoft');
    });
  });
  
  describe('getCategory', () => {
    it('should return Logos category', () => {
      expect(recipe.getCategory()).toBe(Categories.Logos);
    });
  });
  
  describe('isValid', () => {
    it('should return true for valid bindings with image and proper label', () => {
      const binding = {
        imagen: { value: 'https://example.com/image.jpg' },
        itemLabel: { value: 'Valid Entity' }
      };
      
      expect(recipe.isValid(binding)).toBe(true);
    });
    
    it('should return true for valid bindings with logo and proper label', () => {
      const binding = {
        logoLabel: { value: 'https://example.com/logo.jpg' },
        itemLabel: { value: 'Valid Entity' }
      };
      
      expect(recipe.isValid(binding)).toBe(true);
    });
    
    it('should return true for valid bindings with symbol and proper label', () => {
      const binding = {
        symbolLabel: { value: 'https://example.com/symbol.jpg' },
        itemLabel: { value: 'Valid Entity' }
      };
      
      expect(recipe.isValid(binding)).toBe(true);
    });
    
    it('should return false for bindings without any image source', () => {
      const binding = {
        itemLabel: { value: 'Valid Entity' }
      };
      
      expect(recipe.isValid(binding)).toBe(false);
    });
    
    it('should return false for bindings without itemLabel', () => {
      const binding = {
        imagen: { value: 'https://example.com/image.jpg' }
      };
      
      expect(recipe.isValid(binding)).toBe(false);
    });
    
    it('should return false for bindings with Q-prefixed itemLabel', () => {
      const binding = {
        imagen: { value: 'https://example.com/image.jpg' },
        itemLabel: { value: 'Q12345' }
      };
      
      expect(recipe.isValid(binding)).toBe(false);
    });
  });
});
