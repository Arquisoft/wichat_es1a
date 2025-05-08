import { WikidataEntity, Q } from "../../services/wikidata/index";
import { describe, it, expect } from '@jest/globals';

describe('WikidataEntity', () => {  it('should create an entity with the given image_url and name', () => {
    const entity = new WikidataEntity("https://example.com/image.jpg").addAttribute("name", "Paris");

    expect(entity.image_url).toBe("https://example.com/image.jpg");
    expect(entity.getAttribute("name")).toBe("Paris");
  });
});

describe('Q Constants', () => {
  it('should have the correct value for CITY', () => {
    expect(Q.CITY).toBe(515);
  });
});
