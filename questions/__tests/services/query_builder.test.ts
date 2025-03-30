import { WikidataQueryBuilder, WikidataStatement, WDPropertyAssoc } from "../../services/wikidata/query_builder";
import { describe, it, expect } from '@jest/globals';

describe('WikidataQueryBuilder', () => {
  it('Should build the query correctly for instanceOf and assocProperty', () => {
    const query = new WikidataQueryBuilder()
      .instanceOf(146)
      .assocProperty(18, "pic")
      .build();

    expect(query).toBe("SELECT DISTINCT ?item  ?pic ?picLabel  WHERE {?item wdt:P31 wd:Q146;wdt:P18 ?pic ;SERVICE wikibase:label { bd:serviceParam wikibase:language \"es\"}}")
  });

  it('Should correctly format a WDPropertyAssoc with optional set to true', () => {
    const property = new WDPropertyAssoc(123, "testProp", true);
    expect(property.toString()).toBe("OPTIONAL{ ?item wdt:P123 ?testProp ;}");
  });

  it('Should correctly format a WDPropertyAssoc with a language filter', () => {
    const property = new WDPropertyAssoc(123, "testProp", false, "en");
    expect(property.toString()).toBe("wdt:P123 ?testProp  . FILTER (lang(?testProp) = \"en\") ");
  });

  it('Should correctly format a WikidataStatement', () => {
    const statement = new WikidataStatement(456, 789, "example");
    expect(statement.toString()).toBe("?example wdt:P456 wd:Q789;");
  });

  it('Should allow chaining multiple statements and properties', () => {
    const query = new WikidataQueryBuilder()
      .instanceOf(146)
      .subclassOf(279)
      .assocProperty(18, "image")
      .assocProperty(569, "birthDate", true, "es")
      .build();

    expect(query).toContain("wdt:P31 wd:Q146;");
    expect(query).toContain("wdt:P279 wd:Q279;");
    expect(query).toContain("?image");
    expect(query).toContain("OPTIONAL{ ?item wdt:P569 ?birthDate  . FILTER (lang(?birthDate) = \"es\") }");
  });

  it('Should add ordering and limit correctly', () => {
    const query = new WikidataQueryBuilder()
      .instanceOf(146)
      .orderBy("?pic")
      .limit(10)
      .build();

    expect(query).toContain("ORDER BY ?pic");
    expect(query).toContain("LIMIT 10");
  });

  it('Should generate a random order query correctly', () => {
    const query = new WikidataQueryBuilder()
      .instanceOf(146)
      .random()
      .build();

    expect(query).toContain("MD5(CONCAT(str(?item),str(RAND()),str(");
    expect(query).toContain("ORDER BY ?random");
  });
});

