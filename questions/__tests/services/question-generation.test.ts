import { MonumentsRecipe, GeographyRecipe, FlagsRecipe, WikidataRecipe } from '../../services/question-generation';
import { WikidataEntity } from '../../services/wikidata';
import { WikidataQueryBuilder } from '../../services/wikidata/query_builder';

describe('WikidataRecipe classes', () => {
  describe('MonumentsRecipe', () => {
    it('should build appropriate query', () => {
      const recipe = new MonumentsRecipe();
      const qb = new WikidataQueryBuilder();
      const spy = jest.spyOn(qb, 'instanceOf');
      const spyAssoc = jest.spyOn(qb, 'assocProperty');
      
      recipe.buildQuery(qb);
      
      expect(spy).toHaveBeenCalledWith(expect.any(Number));
      expect(spyAssoc).toHaveBeenCalledWith(276, "location", null, true);
    });
    
    it('should extract attributes from binding', () => {
      const recipe = new MonumentsRecipe();
      const binding = {
        itemLabel: { value: 'Eiffel Tower' }
      };
      
      const attributes = recipe.getAttributes(binding);
      
      expect(attributes).toHaveLength(1);
      expect(attributes[0][0]).toBe('item_label');
      expect(attributes[0][1]).toBe('Eiffel Tower');
    });
    
    it('should generate question function', () => {
      const recipe = new MonumentsRecipe();
      const entity = new WikidataEntity('https://example.com/image')
        .addAttribute('item_label', 'Eiffel Tower');
      
      const genFunc = recipe.generateQuestion();
      const result = genFunc(entity);
      
      expect(result).toBe('Eiffel Tower');
    });
    
    it('should return Monuments category', () => {
      const recipe = new MonumentsRecipe();
      expect(recipe.getCategory()).toBe(1); // Categories.Monuments should be 1
    });
  });
    describe('GeographyRecipe', () => {
    it('should build appropriate query', () => {
      const recipe = new GeographyRecipe();
      const qb = new WikidataQueryBuilder();
      const spy = jest.spyOn(qb, 'subclassOf');
      
      recipe.buildQuery(qb);
      
      expect(spy).toHaveBeenCalledWith(expect.any(Number));
    });
    
    it('should extract attributes from binding', () => {
      const recipe = new GeographyRecipe();
      const binding = {
        itemLabel: { value: 'Paris' }
      };
      
      const attributes = recipe.getAttributes(binding);
      
      expect(attributes).toHaveLength(1);
      expect(attributes[0][0]).toBe('item_label');
      expect(attributes[0][1]).toBe('Paris');
    });

    it('should generate question function', () => {
      const recipe = new GeographyRecipe();
      const entity = new WikidataEntity('https://example.com/image')
        .addAttribute('item_label', 'Paris');
      
      const genFunc = recipe.generateQuestion();
      const result = genFunc(entity);
      
      expect(result).toBe('Paris');
    });
    
    it('should return Geography category', () => {
      const recipe = new GeographyRecipe();
      expect(recipe.getCategory()).toBe(2); // Categories.Geography should be 2
    });
  });
    describe('FlagsRecipe', () => {
    it('should build appropriate query', () => {
      const recipe = new FlagsRecipe();
      const qb = new WikidataQueryBuilder();
      const spy = jest.spyOn(qb, 'instanceOf');
      const spyAssoc = jest.spyOn(qb, 'assocProperty');
      
      recipe.buildQuery(qb);
      
      expect(spy).toHaveBeenCalledWith(186516);
      expect(spyAssoc).toHaveBeenCalledWith(1001, "country");
    });
    
    it('should get image URL from binding', () => {
      const recipe = new FlagsRecipe();
      const binding = {
        imagen: { value: 'https://example.com/flag.jpg' }
      };
      
      const imageUrl = recipe.getImageUrl(binding);
      
      expect(imageUrl).toBe('https://example.com/flag.jpg');
    });
    
    it('should check if binding is valid', () => {
      const recipe = new FlagsRecipe();
      
      const validBinding = {
        itemLabel: { value: 'France' }
      };
      
      const invalidBinding = {
        itemLabel: { value: 'Q123' }
      };
      
      const noLabelBinding = {};
      
      expect(recipe.isValid(validBinding)).toBe(true);
      expect(recipe.isValid(invalidBinding)).toBe(false);
      expect(recipe.isValid(noLabelBinding)).toBe(true);
    });

    it('should extract attributes from binding', () => {
      const recipe = new FlagsRecipe();
      const binding = {
        countryLabel: { value: 'Spain' }
      };
      
      const attributes = recipe.getAttributes(binding);
      
      expect(attributes).toHaveLength(1);
      expect(attributes[0][0]).toBe('country');
      expect(attributes[0][1]).toBe('Spain');
    });

    it('should generate question function', () => {
      const recipe = new FlagsRecipe();
      const entity = new WikidataEntity('https://example.com/image')
        .addAttribute('country', 'Spain');
      
      const genFunc = recipe.generateQuestion();
      const result = genFunc(entity);
      
      expect(result).toBe('Spain');
    });
    
    it('should return Flags category', () => {
      const recipe = new FlagsRecipe();
      expect(recipe.getCategory()).toBe(3); // Categories.Flags should be 3
    });
  });
});
