export class WikidataEntity {
    image_url: String;
    common_name: String;
    taxon_name: String;

    constructor(image_url: String, common_name: String, taxon_name: String = "") {
        this.image_url = image_url;
        this.common_name = common_name;
        this.taxon_name = taxon_name;
    }
}

export const Q = {
    ANIMAL : 729,
}
