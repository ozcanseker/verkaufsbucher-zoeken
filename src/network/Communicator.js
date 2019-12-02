import * as CommunicatorPDOK from './Communicators/CommunicatorPDOK';
import * as CommunicatorTRIPLY from './Communicators/CommunicatorTRIPLY';
import * as ClickedCommunicator from './Communicators/ClickedCommunicator';
import Resultaat from "../model/Resultaat";
import * as wellKnown from "wellknown";

/**
 * Laatste string waar op is gezocht
 * @type {string}
 */
let latestString = "";

/**
 * Laatste methode waarop is gezocht
 * @type {string}
 */
let latestMethod = "";

/**
 * Geeft de options voor backends terug
 * @returns {({description: string, text: string, value: string}|{description: string, text: string, value: string})[]}
 */
export function getOptions(){
    return [
        //{ value: 'tes', text: 'Kadaster Labs Elasticsearch', description : "snelste"},
        { value: 'tsp', text: 'Kadaster Labs SPARQL', description : "snel"},
        // { value: 'psp', text: 'PDOK SPARQL', description : "meest actueel"},
    ];
}

/**
 * Deze wordt aangeroepen wanneer de gebruiker iets in het zoekveld typt
 *
 * @param text: gezochte tekst
 * @param method:  de methode waarmee is gezocht
 * @returns {Promise<string|undefined>}
 */
export async function getMatch(text, method) {
    //update eerst de laatst ingetype string
    latestString = text;

    //doe hierna 2 queries. Eentje voor exacte match
    let match = await queryDATALABSKADASTER(stringQuery(text));
    console.log(stringQuery(text));

    //als de gebruiker iets nieuws heeft ingetypt geef dan undefined terug.
    if (latestString !== text) {
        return undefined;
    } else if (match.status > 300) {
        //bij een network error de string error
        return "error";
    }

    //zet deze om in een array met Resultaat.js
    match = await match.text();
    match = await makeSearchScreenResults(JSON.parse(match));
    return match;
}

function makeSearchScreenResults(res){
    res = res.results.bindings;
    let results = [];

    res.forEach(value => {
        let adres = value.streetname.value.replace(/\(adres\)/ig, "");

        results.push(new Resultaat(value.sale.value,
            value.buyers.value,
            value.sellers.value,
            adres,
            wellKnown.parse(value.point.value)
        ))

    });

    return results;
}

/**
 * Deze functie wordt aangeroepen wanneer de gebruiker
 *
 * @param lat
 * @param long
 * @param top
 * @param left
 * @param bottom
 * @param right
 * @returns {Promise<string|*[]|undefined>} Verwacht een lijst met Resultaat.js objecten terug
 */
export async function getFromCoordinates(lat, long, top, left, bottom, right){
    if (right - left > 0.05 || top - bottom > 0.0300) {
        left = long - 0.025;
        right = long + 0.025;
        top = lat + 0.01500;
        bottom = lat - 0.01500;
    }

    let match = await queryDATALABSKADASTER(queryByLocation(top, left, bottom, right));

    if (match.status > 300) {
        //bij een network error de string error
        return "error";
    }

    //Zet deze om in een array met Resultaat.js
    match = await match.text();
    match = await makeSearchScreenResults(JSON.parse(match));

    return match;
}

/**
 * Functie die alle overige attributen ophaalt van het object.
 * De front end gebruikt deze functie voor het clicked resultaat scherm.
 *
 * Deze moet erin blijven als je het opnieuw wilt implmenteren.
 *
 * @param clickedRes een ClickedResultaat.js object die leeg is.
 * @returns {Promise<void>} verwacht niets terug maar moet wel de clickedRes vullen met de loadInAttributes van de ClickedRes.js
 */
export async function getAllAttribtes(clickedRes) {
    if(latestMethod === "tsp"){
        await CommunicatorTRIPLY.getAllAttribtes(clickedRes);
    }else if(latestMethod === "psp"){
        await CommunicatorPDOK.getAllAttribtes(clickedRes);
    }else {
        await CommunicatorTRIPLY.getAllAttribtes(clickedRes);
    }
}

async function queryDATALABSKADASTER(query) {
    return await fetch("https://api.labs.kadaster.nl/datasets/hack-a-lod/verkaufsbucher/services/verkaufsbucher/sparql", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/sparql-query',
            'Accept': 'application/sparql-results+json'
        },
        body: query
    });

}

function stringQuery(string){
    return `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX schema: <http://schema.org/>
    PREFIX histo: <http://rdf.histograph.io/>
    PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>
    PREFIX naa: <http://archief.nl/def/>
    PREFIX sdo: <http://schema.org/>
    PREFIX geo: <http://www.opengis.net/ont/geosparql#>
    
    SELECT ?sale
    (GROUP_CONCAT(distinct ?seller; separator = " & ") as ?sellers)
    (GROUP_CONCAT(distinct ?buyer; separator = " & ") as ?buyers)
    (SAMPLE(?wkt) as ?point)
    (SAMPLE(?streetname) as ?streetname)
    WHERE {
      ?sale schema:seller/foaf:name ?seller.
      ?sale schema:buyer/foaf:name ?buyer.
      ?sale sdo:object/vcard:hasAddress/naa:hasParcelCentroid/geo:asWKT ?wkt.
      ?sale schema:object ?pand .
      ?pand vcard:hasAddress ?street .
      ?street vcard:locality ?plaats .
      ?street dct:type histo:Address .
      ?street rdfs:label ?streetname .
      OPTIONAL { ?sale naa:dateOfFinalSale ?definitieve_koopdatum .}
      FILTER(regex(?seller, "${string}","i") || regex(?buyer, "${string}","i") || regex(?streetname, "${string}","i"))
    }
    
    group by ?sale
    `;
}

function queryByLocation(top, left, bottom, righ){
    return `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX schema: <http://schema.org/>
    PREFIX histo: <http://rdf.histograph.io/>
    PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>
    PREFIX naa: <http://archief.nl/def/>
    PREFIX sdo: <http://schema.org/>
    PREFIX geo: <http://www.opengis.net/ont/geosparql#>
    
    select distinct ?sale
    (GROUP_CONCAT(distinct ?seller; separator = " & ") as ?sellers)
    (GROUP_CONCAT(distinct ?buyer; separator = " & ") as ?buyers)
    (SAMPLE(?xShape) as ?point)
    (SAMPLE(?streetname) as ?streetname)
    {
      ?sale sdo:object/vcard:hasAddress/naa:hasParcelCentroid/geo:asWKT ?xShape.
      ?sale sdo:seller/foaf:name ?seller.
      ?sale sdo:buyer/foaf:name ?buyer.
      ?sale schema:object ?pand .
      ?pand vcard:hasAddress ?street .
      ?street vcard:locality ?plaats .
      ?street dct:type histo:Address .
      ?street rdfs:label ?streetname .
      BIND(bif:st_geomfromtext("POLYGON ((${left} ${bottom}, ${left} ${top}, ${righ} ${top}, ${righ} ${bottom}))") as ?yShape).
      FILTER(bif:st_intersects(?xShape, ?yShape))
    }

    group by ?sale
    `
}
