import { FlagsRecipe, LogosRecipe, WikidataRecipe } from "../question-generation";

export class ItemAttribute {
    name: String;
    value: String;
}

export class WikidataEntity {
    image_url: String;
    attrs: Map<String,String>;
    wdId: Number;

    constructor(image_url: String, wdID: Number = 0) {
        this.image_url = image_url;
        this.wdId = wdID;
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
    CITY: 515,
}

export const P = {
    IMAGE: 18,

    COUNTRY: 17,
    COMMON_NAME: 1843,
}

export const Categories = {
    Flags: 3,
    Logos: 4,
}

export function category_from_str(name: String) : Number | null {
    if (name == "flags")
        return Categories.Flags
    if (name == "logos")
        return Categories.Logos
    return null
}

export function category_into_recipe(cat: Number) : WikidataRecipe {
    if (cat == Categories.Flags)
        return new FlagsRecipe();
    if (cat == Categories.Logos)
        return new LogosRecipe();
    return undefined;
}

