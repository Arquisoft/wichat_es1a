export class WikidataEntity {
    image_url: String;
    common_name: String;

    constructor(image_url: String, common_name: String) {
        this.image_url = image_url;
        this.common_name = common_name;
    }
}

export const Q = {
    ANIMAL : 729,
}
