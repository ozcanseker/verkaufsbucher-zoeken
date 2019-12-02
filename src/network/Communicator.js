import * as CommunicatorPDOK from './Communicators/CommunicatorPDOK';
import * as CommunicatorTRIPLY from './Communicators/CommunicatorTRIPLY';
import * as ClickedCommunicator from './Communicators/ClickedCommunicator';

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
        { value: 'psp', text: 'PDOK SPARQL', description : "meest actueel"},
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
    // latestString = text;
    // latestMethod = method;
    // let res;
    //
    // if(method === "tsp"){
    //     res = await CommunicatorTRIPLY.getMatch(text);
    // }else if(method === "psp"){
    //     res = await CommunicatorPDOK.getMatch(text);
    // }else {
    //     res = await CommunicatorTRIPLY.getMatch(text);
    // }
    //
    // if((text === latestString && latestMethod === method) || res === "error"){
    //     return res;
    // }else{
    //     return undefined;
    // }

    let res = await queryDATALABSKADASTER("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "SELECT * WHERE {\n" +
        "  ?sub ?pred ?obj .\n" +
        "} LIMIT 10");

    res = await res.text();


    console.log(res);
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
    latestString = undefined;
    latestMethod = "tsp";

    let res = await ClickedCommunicator.getFromCoordinates(lat, long, top, left, bottom, right);

    if(latestString === undefined){
        return res;
    }else {
        return undefined;
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

/*
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
  FILTER(regex(?seller, "pe","i") || regex(?buyer, "pe","i") || regex(?streetname, "pe","i"))
}

group by ?sale
*/

/*
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX brt: <http://brt.basisregistraties.overheid.nl/def/top10nl#>
PREFIX sdo: <http://schema.org/>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>
PREFIX naa: <http://archief.nl/def/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

select distinct  ?sale
	(GROUP_CONCAT(distinct ?seller; separator = " & ") as ?sellers)
	(GROUP_CONCAT(distinct ?buyer; separator = " & ") as ?buyers)
	(SAMPLE(?wkt) as ?point)
{
  ?sale sdo:object/vcard:hasAddress/naa:hasParcelCentroid/geo:asWKT ?xShape.
  ?sale sdo:seller/foaf:name ?seller.
  ?sale sdo:buyer/foaf:name ?buyer.
  BIND(bif:st_geomfromtext("POLYGON ((5.949488997453298 52.19636731407295, 5.949488997453298 52.22636731407295, 5.999488997453299 52.22636731407295, 5.999488997453299 52.19636731407295))") as ?yShape).
  FILTER(bif:st_intersects(?xShape, ?yShape))
}

group by ?sale
* */