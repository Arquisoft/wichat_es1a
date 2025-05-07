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
      expect(spyInstance).toHaveBeenCalledWith(5); // Q5 = human
      expect(spyAssoc).toHaveBeenCalledWith(18, "imagen", null, false);
      expect(spyAssoc).toHaveBeenCalledWith(31, "occupation", null, true);
      expect(spyAssoc).toHaveBeenCalledWith(106, "occupation", null, true);
      expect(spyAssoc).toHaveBeenCalledWith(569, "birthDate", null, true);
      expect(spyAssoc).toHaveBeenCalledWith(570, "deathDate", null, true);
    });
  });
    describe('getImageUrl', () => {
    it('should return imagen value if available', () => {
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
      expect(consoleSpy).toHaveBeenCalledWith('No image found for person:', 'Test Entity');
      
      consoleSpy.mockRestore();
    });
    
    it('should handle entities with no label', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const binding = {};
      
      const result = recipe.getImageUrl(binding);
      
      expect(result).toBe('');
      expect(consoleSpy).toHaveBeenCalledWith('No image found for person:', 'Unknown');
      
      consoleSpy.mockRestore();
    });
  });
    describe('getAttributes', () => {
    it('should collect all available attributes for a famous person', () => {
      const binding = {
        imagen: { value: 'Image URL' },
        itemLabel: { value: 'Famous Person Name' },
        occupationLabel: { value: 'Actor' },
        birthDateLabel: { value: '1980-01-01' },
        deathDateLabel: { value: '2020-01-01' }
      };
      
      const attributes = recipe.getAttributes(binding);
      
      expect(attributes).toHaveLength(4);
      expect(attributes).toContainEqual(['item_label', 'Famous Person Name']);
      expect(attributes).toContainEqual(['occupation', 'Actor']);
      expect(attributes).toContainEqual(['birth_date', '1980-01-01']);
      expect(attributes).toContainEqual(['death_date', '2020-01-01']);
    });
    
    it('should handle missing attributes', () => {
      const binding = {
        imagen: { value: 'Image URL' },
        itemLabel: { value: 'Famous Person Name' }
      };
      
      const attributes = recipe.getAttributes(binding);
      
      expect(attributes).toHaveLength(1);
      expect(attributes).toContainEqual(['item_label', 'Famous Person Name']);
    });
    
    it('should provide a placeholder when item label is missing', () => {
      const binding = {
        imagen: { value: 'Image URL' }
      };
      
      const attributes = recipe.getAttributes(binding);
      
      expect(attributes).toHaveLength(1);
      expect(attributes).toContainEqual(['item_label', 'Persona desconocida']);
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
        itemLabel: { value: 'Valid Person' }
      };
      
      expect(recipe.isValid(binding)).toBe(true);
    });
    
    it('should return false for bindings without any image source', () => {
      const binding = {
        itemLabel: { value: 'Valid Person' }
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
