import axios from 'axios';

const apiUrl = 'https://query.wikidata.org/sparql';
const headers = {
    'User-Agent': 'QuestionGeneration/1.0',
    'Accept': 'application/json',
};

class PropertyAssoc {
    id: Number
    name: String
    optional: boolean

    constructor(id: Number, name: String, optional: boolean) {
        this.id = id;
        this.name = name;
        this.optional = optional;
    }
}

// export class WikidataEntity {
//     name: String,
//     label
// }

export class WikidataQueryBuilder {
    _instanceOf: Number | null;
    _assocProperties: PropertyAssoc[];
    _limit: Number | null;

    constructor() {
        this._instanceOf = null;
        this._assocProperties = [];
    }

    instanceOf(category: Number) : WikidataQueryBuilder {
        this._instanceOf = category;
        return this;
    }

    assocProperty(id: Number, name: String, optional: boolean = false) : WikidataQueryBuilder {
        this._assocProperties.push({id, name, optional});
        return this;
    }

    build() : String {
        let query = "SELECT ?item "
        this._assocProperties.forEach(prop => query += `?${prop.name} `);
        query += "WHERE {"

        if (this._instanceOf) {
            query += `?item wdt:P31 wd:Q${this._instanceOf};`
        }

        this._assocProperties.forEach(prop => {
            let text = `wdt:P${prop.id} ?${prop.name};`;
            if (prop.optional)
                text = `OPTIONAL{${text}}`
            query += text
        });

        query += "}";
        if (this._limit) {
            query += "LIMIT " + this._limit;
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
