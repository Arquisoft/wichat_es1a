import { WikidataRecipe, FlagsRecipe } from "../../services/question-generation";
import { WikidataQueryBuilder } from "../../services/wikidata/query_builder";
import { WikidataEntity } from "../../services/wikidata";

// Ya no hay servicio de procesamiento de imágenes para mockearse

describe('WikidataRecipe', () => {
  // Test para el método isValid
  describe('isValid', () => {
    class TestRecipe extends WikidataRecipe {
      buildQuery(qb: WikidataQueryBuilder): void { /* Implementación vacía */ }
      getAttributes(binding: any): Array<[String, String]> { return []; }
      generateQuestion(): any { return () => "question"; }
      getCategory(): Number { return 0; }
    }

    const recipe = new TestRecipe();

    test('should return false if itemLabel starts with "Q"', () => {
      const binding = { itemLabel: { value: 'Q123456' } };
      expect(recipe.isValid(binding)).toBe(false);
    });

    test('should return true if itemLabel does not start with "Q"', () => {
      const binding = { itemLabel: { value: 'España' } };
      expect(recipe.isValid(binding)).toBe(true);
    });

    test('should return true if itemLabel is not defined', () => {
      const binding = { otherProperty: { value: 'something' } };
      expect(recipe.isValid(binding)).toBe(true);
    });
  });
});

describe('FlagsRecipe', () => {
  let flagsRecipe: FlagsRecipe;
  let queryBuilder: WikidataQueryBuilder;

  beforeEach(() => {
    flagsRecipe = new FlagsRecipe();
    queryBuilder = new WikidataQueryBuilder();
    // Espiar los métodos del queryBuilder
    jest.spyOn(queryBuilder, 'instanceOf');
    jest.spyOn(queryBuilder, 'assocProperty');
  });

  test('buildQuery should call instanceOf and assocProperty', () => {
    flagsRecipe.buildQuery(queryBuilder);
    expect(queryBuilder.instanceOf).toHaveBeenCalledWith(186516);
    expect(queryBuilder.assocProperty).toHaveBeenCalledWith(1001, "country");
  });

  test('getImageUrl should return the image URL from binding', async () => {
    const binding = { imagen: { value: 'https://example.com/flag.png' } };
    const url = await flagsRecipe.getImageUrl(binding);
    expect(url).toBe('https://example.com/flag.png');
  });

  test('getAttributes should return country attribute', () => {
    const binding = { countryLabel: { value: 'España' } };
    const attributes = flagsRecipe.getAttributes(binding);
    expect(attributes).toEqual([['country', 'España']]);
  });

  test('generateQuestion should return a function that gets the country attribute', () => {
    const genFunction = flagsRecipe.generateQuestion();
    const entity = new WikidataEntity("https://example.com/flag.png");
    entity.addAttribute("country", "España");
    expect(genFunction(entity)).toBe("España");
  });

  test('getCategory should return the Flags category', () => {
    expect(flagsRecipe.getCategory()).toBe(3); // Categories.Flags
  });
});
