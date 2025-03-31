import { WikidataEntity, Q } from "../../services/wikidata/index";
import { describe, it, expect } from '@jest/globals';

describe('WikidataEntity', () => {
  it('should create an entity with the given image_url and common_name', () => {
    const entity = new WikidataEntity("https://example.com/image.jpg").addAttribute("common_name", "Lion");

    expect(entity.image_url).toBe("https://example.com/image.jpg");
    expect(entity.getAttribute("common_name")).toBe("Lion");
  });
});

describe('Q Constants', () => {
  it('should have the correct value for ANIMAL', () => {
    expect(Q.ANIMAL).toBe(729);
  });
});
