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
        qb.instanceOf(14073567)
        .assocProperty(18, "imagen", null, false)  // P18 = imagen
        
        // Intentamos obtener logo o símbolo, pero son opcionales
        .assocProperty(154, "logo", null, true)  // P154 = logo
        .assocProperty(487, "symbol", null, true)  // P487 = símbolo
    }getImageUrl(binding: any): String {
        // Más robusto - verifica todas las posibles fuentes de imagen
        if (binding.symbolLabel && binding.symbolLabel.value) {
            return binding.symbolLabel.value;
        }
        if (binding.logoLabel && binding.logoLabel.value) {
            return binding.logoLabel.value;
        }
        if (binding.imagen && binding.imagen.value) {
            return binding.imagen.value;
        }
        
        // Si llegamos aquí, no hay imágenes disponibles
        console.log("No image found for entity:", binding.itemLabel?.value || "Unknown");
        return "";
    }    getAttributes(binding: any): Array<[String, String]> {
        const attributes = [];
        
        // Recopilar todos los atributos disponibles
        if (binding.symbolLabel && binding.symbolLabel.value) {
            attributes.push(["symbol", binding.symbolLabel.value]);
        }
        
        if (binding.logoLabel && binding.logoLabel.value) {
            attributes.push(["logo", binding.logoLabel.value]);
        }
        
        if (binding.imagen && binding.imagen.value) {
            attributes.push(["imagen", binding.imagen.value]);
        }
        
        // El nombre de la entidad es esencial para la pregunta
        if (binding.itemLabel && binding.itemLabel.value) {
            attributes.push(["item_label", binding.itemLabel.value]);
        } else {
            // Si no hay nombre, poner un placeholder para evitar errores
            attributes.push(["item_label", "Entidad desconocida"]);
        }
        
        return attributes;
    }
    generateQuestion(): GenFunction {
        return (we: WikidataEntity) => we.getAttribute("item_label")
    }    getCategory(): Number {
        return Categories.Logos
    }
    
    // Sobrescribimos el método isValid para ser más permisivo con logos y símbolos
    isValid(binding: any): boolean {
        // Primero verificamos que tenga una imagen que mostrar
        const hasImage = (
            (binding.imagen && binding.imagen.value) || 
            (binding.logoLabel && binding.logoLabel.value) || 
            (binding.symbolLabel && binding.symbolLabel.value)
        );
        
        if (!hasImage) {
            return false;
        }
        
        // Luego verificamos que tenga un nombre válido
        let itemLabel = binding.itemLabel;
        if (!itemLabel || !itemLabel.value) {
            return false;
        }
        
        // Los IDs de Wikidata comienzan con Q, no son útiles como respuestas
        if (itemLabel.value.startsWith("Q")) {
            return false;
        }
        
        return true;
    }
}
