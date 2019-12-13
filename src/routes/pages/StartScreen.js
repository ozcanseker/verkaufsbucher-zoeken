import React from 'react';

class StartScreen extends React.Component {
    render() {
        return (
            <div className="startScreen">
                <p className="boldHeaderText">Verkaufsbücher</p>
                <p className="explainText">
                    Op deze website worden nieuwe technieken ingezet om oude gegevens op een andere manier toegankelijk
                    te maken. Zo ontstaat er bijzonder en nieuw inzicht in het verleden.<br/><br/>
                    De Verkaufsbücher vormen een overzicht van ruim 7000 gedwongen transacties van onroerend goed uit de
                    Tweede Wereldoorlog. Tijdens de bezetting worden door de Duitsers panden verkocht waarvan de
                    eigenaren veelal Joods zijn. Deze administratieve registers zijn de zogenaamde Verkaufsbücher en
                    deze worden bewaard bij het Nationaal Archief. Ze maken deel uit van het archief van het Nederlands
                    Beheer Instituut (NBI).<br/><br/>
                    De gegevens uit de Verkaufsbücher zijn nu gekoppeld aan gegevens van het Kadaster, waardoor deze
                    onrechtmatige verhandelingen letterlijk in kaart kunnen worden gebracht.<br/>
                </p>

                <p className="boldHeaderText">Hoe werkt het?</p>
                <p className="explainText">
                    Je kunt op twee manieren zoeken:
                </p>
                <ol>
                    <li>
                        Tik in het zoekveld hierboven een naam, straat of plaatsnaam in.
                    </li>
                    <li>
                        Klik met je rechtermuisknop in de kaart (bij een aanraakscherm je vinger twee seconden op de
                        kaart houden) en alle objecten met een naam in de buurt verschijnen.
                    </li>
                </ol>
                <br/>
                <p className={"explainText"}>
                    Wanneer je een of meer zoekresultaten in het uitklapmenu hebt gekregen, kun je het gewenste resultaat aanklikken. Links verschijnen de gegevens van de transactie en rechts verschijnt de locatie op de kaart.
                    <br/><br/>
                    De oorspronkelijke eigenaar van het pand wordt in de Verkaufsbücher 'verkoper' genoemd. Om dicht bij de bron te blijven, is deze term hier overgenomen, maar het moge duidelijk zijn dat het hier niet om een vrijwillige verkoop gaat.
                    <br/><br/>
                    De prijs waarvoor het betreffende pand gekocht is, is omgerekend naar de waarde in euro's in 2018.
                </p>
            </div>
        )
    }
}

export default StartScreen;