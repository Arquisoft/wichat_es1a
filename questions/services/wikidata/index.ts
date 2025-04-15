import { AnimalRecipe, FlagsRecipe, GeographyRecipe, WikidataRecipe } from "../question-generation";

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
    ANIMAL: 729,
    CITY: 515,
}

export const P = {
    IMAGE: 18,

    COUNTRY: 17,
    COMMON_NAME: 1843,
    TAXON_NAME: 225,
}

export const Categories = {
    Animals: 1,
    Geography: 2,
    Flags: 3,
}

export function category_from_str(name: String) : Number | null {
    if (name == "animals")
        return Categories.Animals
    if (name == "geography")
        return Categories.Geography
    if (name == "flags")
        return Categories.Flags
    return null
}

export function category_into_recipe(cat: Number) : WikidataRecipe {
    if (cat == Categories.Animals)
        return new AnimalRecipe();
    if (cat == Categories.Geography)
        return new GeographyRecipe();
    if (cat == Categories.Flags)
        return new FlagsRecipe();
    return undefined;
}

