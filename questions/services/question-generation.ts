import { Categories, P, Q, WikidataEntity } from "./wikidata";
import { WikidataQueryBuilder } from "./wikidata/query_builder";

export type GenFunction = (we: WikidataEntity) => String;

export abstract class WikidataRecipe {
    abstract buildQuery(qb: WikidataQueryBuilder): void;
    getImageUrl(binding: any) : String {
         return binding.imagen.value
    }
    isValid(binding: any) : boolean {
       let itemLabel = binding.itemLabel;
       if (itemLabel)
           return !itemLabel.value.startsWith("Q")
       else
           return true
    }
    abstract getAttributes(binding: any) : Array<[String,String]>;
    abstract generateQuestion(): GenFunction;
    abstract getCategory() : Number;
}

export class MonumentsRecipe extends WikidataRecipe {
    buildQuery(qb: WikidataQueryBuilder) {
        qb
        .instanceOf(Q.MONUMENT)
        .assocProperty(276, "location", null, true)  // P276 es la propiedad "location"
    }
    getAttributes(binding: any): Array<[String,String]> {
        return [
            ["item_label", binding.itemLabel.value],
        ]
    }
    generateQuestion(): GenFunction {
        return (we: WikidataEntity) => we.getAttribute("item_label")
    }
    getCategory(): Number {
        return Categories.Monuments
    }
}

export class GeographyRecipe extends WikidataRecipe {
    buildQuery(qb: WikidataQueryBuilder) {
        qb.subclassOf(Q.CITY)
    }
    getAttributes(binding: any): [String,String][] {
        return [
            ["item_label", binding.itemLabel.value],
        ]
    }
    generateQuestion(): GenFunction {
        return (we: WikidataEntity) => we.getAttribute("item_label")
    }

    getCategory(): Number {
        return Categories.Geography
    }

}

export class FlagsRecipe extends WikidataRecipe {
    buildQuery(qb: WikidataQueryBuilder) {
        qb
        .instanceOf(186516)
        .assocProperty(1001, "country")
    }
    getAttributes(binding: any): Array<[String, String]> {
        return [
            ["country", binding.countryLabel.value],
        ]
    }
    generateQuestion(): GenFunction {
        return (we: WikidataEntity) => we.getAttribute("country")
    }
    getCategory(): Number {
        return Categories.Flags
    }

}

export class LogosRecipe extends WikidataRecipe {
    buildQuery(qb: WikidataQueryBuilder) {
        qb.clearProperties();
        qb
        .instanceOf(4830453)  // Sigue buscando empresas/negocios
        .assocProperty(361, "partof", 242345)
        .assocProperty(154, "logo")
        .assocProperty(487, "symbol")  // También busca símbolos asociados
    }
    getImageUrl(binding: any): String {
        // Prioriza el uso de símbolos sobre logos si están disponibles
        if (binding.symbolLabel && binding.symbolLabel.value) {
            return binding.symbolLabel.value;
        }
        return binding.logoLabel.value;
    }
    getAttributes(binding: any): Array<[String, String]> {
        const attributes = [];
        
        // Añadir logo o símbolo según esté disponible
        if (binding.symbolLabel && binding.symbolLabel.value) {
            attributes.push(["symbol", binding.symbolLabel.value]);
        } else if (binding.logoLabel && binding.logoLabel.value) {
            attributes.push(["logo", binding.logoLabel.value]);
        }
        
        attributes.push(["item_label", binding.itemLabel.value]);
        return attributes;
    }
    generateQuestion(): GenFunction {
        return (we: WikidataEntity) => we.getAttribute("item_label")
    }
    getCategory(): Number {
        return Categories.Logos
    }

}
