import { FlagsRecipe, GeographyRecipe, LogosRecipe, MonumentsRecipe, WikidataRecipe } from "../question-generation";

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
    MONUMENT: 4989906,
    CITY: 515,
}

export const P = {
    IMAGE: 18,

    COUNTRY: 17,
    COMMON_NAME: 1843,
    TAXON_NAME: 225,
}

export const Categories = {
    Monuments: 1,
    Geography: 2,
    Flags: 3,
    Logos: 4,
}

export function category_from_str(name: String) : Number | null {
    if (name == "monuments")
        return Categories.Monuments
    if (name == "geography")
        return Categories.Geography
    if (name == "flags")
        return Categories.Flags
    if (name == "logos")
        return Categories.Logos
    return null
}

export function category_into_recipe(cat: Number) : WikidataRecipe {
    if (cat == Categories.Monuments)
        return new MonumentsRecipe();
    if (cat == Categories.Geography)
        return new GeographyRecipe();
    if (cat == Categories.Flags)
        return new FlagsRecipe();
    if (cat == Categories.Logos)
        return new LogosRecipe();
    return undefined;
}

