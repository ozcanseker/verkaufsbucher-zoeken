/**
 * Het resultaat dat aangeklikt is.
 * Kan op twee manieren gegevens in laden. Met de constructor of de methode loadInAttributes.
 */
import Observable from "./Observable";

class ClickedResultaat extends Observable {
    /**
     *
     * @param res het resultaat dat is aangeklikt
     * @param price
     * @param adres
     * @param place
     * @param date
     * @param buyers
     * @param sellers
     */
    constructor(res, price, adres, place, date, buyers, sellers) {
        super();

        this._res = res;
        this._price = price;
        this._adres = adres;
        this._place = place;
        this._date = date;
        this._buyers = buyers;
        this._sellers = sellers;
    }

    /**
     * @param price
     * @param adres
     * @param place
     * @param date
     * @param buyers
     * @param sellers
     */
    loadInAttributes(price, adres, place, date, buyers, sellers) {
        this._price = price;
        this._adres = adres;
        this._place = place;
        this._date = date;
        this._buyers = buyers;
        this._sellers = sellers;

        this.updateSubscribers();
    }

    getSellers(){
        return this._sellers;
    }

    getBuyers(){
        return this._buyers;
    }

    getDate(){
        return this._date;
    }

    getPlace(){
        return this._place;
    }

    getPrice(){
        return this._price;
    }

    getAdres(){
        return this._adres;
    }

    getUrl() {
        return this._res.getUrl();
    }

    getAsFeature() {
        return this._res.getAsFeature();
    }

    getRes(){
        return this._res;
    }
}

export default ClickedResultaat;