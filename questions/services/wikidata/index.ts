
export class ItemAttribute {
    name: String;
    value: String;
}

export class WikidataEntity {
    image_url: String;
    attrs: Map<String,String>;

    constructor(image_url: String) {
        this.image_url = image_url;
        this.attrs = new Map();
    }

    public addAttribute(name: String, value: String) : WikidataEntity {
        this.attrs.set(name, value);
        return this;
    }

    public getAttribute(name: String) : String | undefined {
        return this.attrs.get(name);
    }
}

export const Q = {
    ANIMAL: 729,
}

export const P = {
    IMAGE: 18,
    COMMON_NAME: 1843,
    TAXON_NAME: 225,
}
