import axios from 'axios';

const apiUrl = 'https://query.wikidata.org/sparql';
const headers = {
    'User-Agent': 'QuestionGeneration/1.0',
    'Accept': 'application/json',
};

export class WDPropertyAssoc {
    id: Number
    name: String
    optional: boolean
    lang: String | null

    constructor(id: Number, name: String, optional: boolean = false, lang = null) {
        this.id = id;
        this.name = name;
        this.optional = optional;
        this.lang = lang;
    }

    toString() : String {
        let filter = ";";
        if (this.lang != null) {
            filter = ` . FILTER (lang(?${this.name}) = "${this.lang}") `;
        }
        let text = `wdt:P${this.id} ?${this.name} ${filter}`;
        if (this.optional)
            text = `OPTIONAL{ ?item ${text}}`
        return text;
    }
}

export class WikidataStatement {
    name: String;
    prop: Number;
    value: Number;

    constructor(prop: Number, value: Number, name: String = "item") {
        this.name = name;
        this.prop = prop;
        this.value = value;
    }

    toString() : String {
        return `?${this.name} wdt:P${this.prop} wd:Q${this.value};`;
    }
}

export class WikidataQueryBuilder {
    private _statements: WikidataStatement[];
    private _assocProperties: WDPropertyAssoc[];
    private _random: Boolean = false;
    private _limit: Number | null;
    private _orderBy: String | null
    private _language: String = "es";

    constructor() {
        this._statements = [];
        this._assocProperties = [];
    }

    instanceOf(category: Number) : WikidataQueryBuilder {
        this._statements.push(new WikidataStatement(31, category));
        return this;
    }

    subclassOf(category: Number) : WikidataQueryBuilder {
        this._statements.push(new WikidataStatement(279, category));
        return this;
    }

    statement(stmt: WikidataStatement) : WikidataQueryBuilder {
        this._statements.push(stmt);
        return this;
    }

    assocProperty(id: Number, name: String, optional: boolean = false, lang: String = null) : WikidataQueryBuilder {
        this._assocProperties.push(new WDPropertyAssoc(id, name, optional, lang));
        return this;
    }

    orderBy(ord: String) : WikidataQueryBuilder {
        this._orderBy = ord;
        return this
    }

    random() : WikidataQueryBuilder {
        this._random = true;
        return this
    }

    limit(n: Number) : WikidataQueryBuilder {
        this._limit = n;
        return this
    }

    language(lang: String) : WikidataQueryBuilder {
        this._language = lang;
        return this;
    }

    build() : String {
        let query = "";
        query += "SELECT DISTINCT ?item ?itemLabel ?qid "
        this._assocProperties.forEach(prop => {
            query += ` ?${prop.name} ?${prop.name}Label `
        });
        if (this._random) {
            query += `(MD5(CONCAT(str(?item),str(RAND()),str(${Date.now()}))) as ?random) `;
        }
        query += " WHERE {"

        this._statements.forEach((stmt) => {
            query += stmt.toString()
        })

        this._assocProperties.filter((p) => !p.optional).forEach((prop) => {
            query += prop.toString()
        });

        this._assocProperties.filter((p) => p.optional).forEach((prop) => {
            query += prop.toString()
        });

        query += `BIND(STRAFTER(STR(?item), STR(wd:)) AS ?qid) .`
        query += `SERVICE wikibase:label { bd:serviceParam wikibase:language "${this._language}"}`;

        query += "}";
        if (this._random) {
            query += " ORDER BY ?random";
        }
        if (this._orderBy) {
            query += " ORDER BY " + this._orderBy;
        }
        if (this._limit) {
            query += " LIMIT " + this._limit;
        }
        return query
    }

    public async send() {
        return await axios.get(apiUrl, {
            params: {
                query: this.build(),
                format: "json"
            },
            headers
        })
    }

}

