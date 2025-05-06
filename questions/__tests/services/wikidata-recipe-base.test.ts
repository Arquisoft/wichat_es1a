import { WikidataRecipe } from '../../services/question-generation';
import { WikidataQueryBuilder } from '../../services/wikidata/query_builder';
import { WikidataEntity } from '../../services/wikidata';

// Test implementation of abstract WikidataRecipe class
class TestRecipe extends WikidataRecipe {
  buildQuery(qb: WikidataQueryBuilder): void {
    qb.instanceOf(123);
  }
  
  getAttributes(binding: any): Array<[String, String]> {
    return [['test', 'value']];
  }
  
  generateQuestion(): (we: WikidataEntity) => String {
    return (we) => 'test question';
  }
  
  getCategory(): Number {
    return 999;
  }
}

describe('WikidataRecipe base class', () => {
  let recipe: WikidataRecipe;
  
  beforeEach(() => {
    recipe = new TestRecipe();
  });
  
  describe('getImageUrl', () => {
    it('should return imagen value by default', () => {
      const binding = {
        imagen: { value: 'https://example.com/image.jpg' }
      };
      
      const result = recipe.getImageUrl(binding);
      expect(result).toBe('https://example.com/image.jpg');
    });
    
    it('should handle missing imagen value', () => {
      const binding = {};
      
      // This will throw because binding.imagen is undefined
      expect(() => recipe.getImageUrl(binding)).toThrow();
    });
  });
  
  describe('isValid', () => {
    it('should return true for items without Q-prefixed labels', () => {
      const binding = {
        itemLabel: { value: 'Valid Item' }
      };
      
      expect(recipe.isValid(binding)).toBe(true);
    });
    
    it('should return false for items with Q-prefixed labels', () => {
      const binding = {
        itemLabel: { value: 'Q12345' }
      };
      
      expect(recipe.isValid(binding)).toBe(false);
    });
    
    it('should return true if itemLabel is undefined', () => {
      const binding = {};
      
      expect(recipe.isValid(binding)).toBe(true);
    });
  });
});
