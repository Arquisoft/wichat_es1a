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
        .assocProperty(17, "country", null, true)   // P17 es la propiedad "país"
        .random()                                   // Obtener resultados aleatorios
        .limit(50)                                  // Aumentar el límite para obtener más monumentos
    }
    getAttributes(binding: any): Array<[String,String]> {
        let attributes: [String, String][] = [["item_label", binding.itemLabel.value]];
        
        // Añadir el país al que pertenece el monumento si está disponible
        if (binding.countryLabel && binding.countryLabel.value) {
            attributes.push(["country", binding.countryLabel.value]);
        }
        
        return attributes;
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
        // Usamos la clase "humano" como instancia base (Q5 es el ID de Wikidata para "humano")
        qb.instanceOf(5)
        // Requisitos adicionales para filtrar personas famosas
        .assocProperty(31, "occupation", null, true)   // P31 = instancia de
        .assocProperty(18, "imagen", null, false)      // P18 = imagen (requerido)
        .assocProperty(106, "occupation", null, true)  // P106 = ocupación
        .assocProperty(569, "birthDate", null, true)   // P569 = fecha de nacimiento
        .assocProperty(570, "deathDate", null, true)   // P570 = fecha de muerte (opcional)
        .random()                                      // Obtener resultados aleatorios
        .limit(50)                                     // Aumentar el límite para obtener más personas
    }
    
    getImageUrl(binding: any): String {
        if (binding.imagen && binding.imagen.value) {
            return binding.imagen.value;
        }
        
        // Si llegamos aquí, no hay imágenes disponibles
        console.log("No image found for person:", binding.itemLabel?.value || "Unknown");
        return "";
    }
    
    getAttributes(binding: any): Array<[String, String]> {
        const attributes = [];
        
        // El nombre de la persona es esencial para la pregunta
        if (binding.itemLabel && binding.itemLabel.value) {
            attributes.push(["item_label", binding.itemLabel.value]);
        } else {
            // Si no hay nombre, poner un placeholder para evitar errores
            attributes.push(["item_label", "Persona desconocida"]);
        }
        
        // Añadir ocupación si está disponible
        if (binding.occupationLabel && binding.occupationLabel.value) {
            attributes.push(["occupation", binding.occupationLabel.value]);
        }
        
        // Añadir fecha de nacimiento si está disponible
        if (binding.birthDateLabel && binding.birthDateLabel.value) {
            attributes.push(["birth_date", binding.birthDateLabel.value]);
        }
        
        // Añadir fecha de muerte si está disponible
        if (binding.deathDateLabel && binding.deathDateLabel.value) {
            attributes.push(["death_date", binding.deathDateLabel.value]);
        }
        
        return attributes;
    }
    
    generateQuestion(): GenFunction {
        return (we: WikidataEntity) => we.getAttribute("item_label")
    }
    
    getCategory(): Number {
        return Categories.Logos
    }
    
    // Sobrescribimos el método isValid para personas famosas
    isValid(binding: any): boolean {
        // Verificar que tenga una imagen
        const hasImage = binding.imagen && binding.imagen.value;
        
        if (!hasImage) {
            return false;
        }
        
        // Verificar que tenga un nombre válido
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
