class Person {
    constructor(name, country, adres, city, label) {
        this._name = name ? name : label;

        if(city){
            this._location = city;
        }else if(adres){
            this._location = adres;
        }else{
            this._location = country;
        }
    }

    getName(){
        return this._name;
    }

    getLocation(){
        return this._location;
    }
}

export default Person;