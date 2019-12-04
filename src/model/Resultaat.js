/**
 * Een resultaat op het resultaten scherm.
 */
import Observable from "./Observable";

class Resultaat extends Observable{
    /**
     * @param url string
     * @param koper
     * @param verkoper
     * @param adres
     * @param geoJson geoJson object
     */
    constructor(url , koper, verkoper, adres,geoJson){
        super();
        this._url = url;

        this._koper = koper;
        this._verkoper = verkoper;
        this._adres = adres;
        this._geoJson = geoJson;

        this._onHoverDef = undefined;
        this._onHoverOffDef = undefined;
    }

    getVerkoper(){
        return this._verkoper;
    }

    getKoper(){
        return this._koper;
    }

    getUrl(){
        return this._url;
    }

    getGeoJson(){
        return this._geoJson;
    }

    setGeoJson(geoJson){
        this._geoJson = geoJson;
    }

    getAdres(){
        return this._adres;
    }

    /**
     * Geeft een feature object terug met zichzelf en geojson
     * @returns {{geometry: GeoJson, properties: Resultaat}}
     */
    getAsFeature(){
        return  {
            type: "Feature",
            properties: this,
            geometry: this._geoJson
        }
    }

    _setOnHover(func){
        this._onHoverDef = func;
    }

    _setOnHoverOff(func){
        this._onHoverOffDef = func;
    }

    _onHover(){
        if(this._onHoverDef){
            this._onHoverDef();
        }
    }

    _onHoverOff(){
        if (this._onHoverOffDef) {
            this._onHoverOffDef()
        }
    }
}

export default Resultaat;