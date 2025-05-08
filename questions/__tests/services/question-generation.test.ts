import { WikidataRecipe, FlagsRecipe, LogosRecipe } from "../../services/question-generation";
import { WikidataQueryBuilder } from "../../services/wikidata/query_builder";
import { WikidataEntity } from "../../services/wikidata";
import { ImageProcessingService } from "../../services/image-processing-service";

// Mock de ImageProcessingService
jest.mock('../../services/image-processing-service', () => {
  const mockProcessLogoImage = jest.fn().mockImplementation((url) => {
    return Promise.resolve(`processed-${url}`);
  });

  const mockInstance = {
    processLogoImage: mockProcessLogoImage,
    getInstance: jest.fn(),
  };

  return {
    ImageProcessingService: {
      getInstance: jest.fn().mockReturnValue(mockInstance),
    },
  };
});

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

describe('LogosRecipe', () => {
  let logosRecipe: LogosRecipe;
  let queryBuilder: WikidataQueryBuilder;

  beforeEach(() => {
    logosRecipe = new LogosRecipe();
    queryBuilder = new WikidataQueryBuilder();
    // Espiar los métodos del queryBuilder
    jest.spyOn(queryBuilder, 'clearProperties');
    jest.spyOn(queryBuilder, 'instanceOf');
    jest.spyOn(queryBuilder, 'assocProperty');
  });

  test('buildQuery should call clearProperties, instanceOf and assocProperty', () => {
    logosRecipe.buildQuery(queryBuilder);
    expect(queryBuilder.clearProperties).toHaveBeenCalled();
    expect(queryBuilder.instanceOf).toHaveBeenCalledWith(4830453);
    expect(queryBuilder.assocProperty).toHaveBeenCalledWith(361, "partof", 242345);
    expect(queryBuilder.assocProperty).toHaveBeenCalledWith(154, "logo");
  });

  test('getImageUrl should process the logo image', async () => {
    const binding = { logoLabel: { value: 'https://example.com/logo.png' } };
    const url = await logosRecipe.getImageUrl(binding);
    
    // Verificar que el servicio de procesamiento de imágenes fue llamado
    expect(ImageProcessingService.getInstance).toHaveBeenCalled();
    expect(ImageProcessingService.getInstance().processLogoImage).toHaveBeenCalledWith('https://example.com/logo.png');
    
    // Verificar que se devuelve la URL procesada
    expect(url).toBe('processed-https://example.com/logo.png');
  });
  test('getImageUrl should return the original URL if processing fails', async () => {
    const binding = { logoLabel: { value: 'https://example.com/error-logo.png' } };
    
    // Configurar el mock para que falle
    const mockImageProcessingService = ImageProcessingService.getInstance();
    mockImageProcessingService.processLogoImage = jest.fn().mockImplementationOnce(() => {
      throw new Error('Processing failed');
    });
    
    const url = await logosRecipe.getImageUrl(binding);
    
    // Verificar que se devuelve la URL original
    expect(url).toBe('https://example.com/error-logo.png');
  });

  test('getAttributes should return logo and item_label attributes', () => {
    const binding = { 
      logoLabel: { value: 'https://example.com/logo.png' },
      itemLabel: { value: 'Microsoft' }
    };
    const attributes = logosRecipe.getAttributes(binding);
    expect(attributes).toEqual([
      ['logo', 'https://example.com/logo.png'],
      ['item_label', 'Microsoft']
    ]);
  });

  test('generateQuestion should return a function that gets the item_label attribute', () => {
    const genFunction = logosRecipe.generateQuestion();
    const entity = new WikidataEntity("https://example.com/logo.png");
    entity.addAttribute("item_label", "Microsoft");
    expect(genFunction(entity)).toBe("Microsoft");
  });

  test('getCategory should return the Logos category', () => {
    expect(logosRecipe.getCategory()).toBe(4); // Categories.Logos
  });
});
