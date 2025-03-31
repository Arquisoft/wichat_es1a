import { AnimalRecipe, CitiesRecipe, WikidataRecipe } from "../question-generation";

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
    Cities: 2,
}

export function category_from_str(name: String) : Number | null {
    if (name == "animals")
        return Categories.Animals
    if (name == "cities")
        return Categories.Cities
    return null
}

export function category_into_recipe(cat: Number) : WikidataRecipe {
    if (cat == Categories.Animals)
        return new AnimalRecipe();
    if (cat == Categories.Cities)
        return new CitiesRecipe();
    return undefined;
}

