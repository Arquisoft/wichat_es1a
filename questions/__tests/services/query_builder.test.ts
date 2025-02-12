const assert = require('assert');
const { WikidataQueryBuilder } = require("../../services/query_builder.ts")
const { describe, expect, test, it } = require('@jest/globals');

describe('catsWithPhotos', () => {
  it('Should build the query correctly', () => {
      let s = new WikidataQueryBuilder()
                .instanceOf(146)
                .assocProperty(18, "pic")
                .build();
      assert.strictEqual(s, "SELECT ?item ?pic WHERE {?item wdt:P31 wd:Q146;wdt:P18 ?pic;}")
  })
});
