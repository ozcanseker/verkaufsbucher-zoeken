/**
 * Libs
 */
import L from "leaflet";
import React from 'react';
import * as turf from '@turf/turf';
import _ from 'lodash';

import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

/**
 * UI
 */
import Routes from './routes/Routes'
import {Icon, Search} from 'semantic-ui-react'
import NavBar from "./components/NavBar";
import Loader from "./components/Loader";

/**
 * Assets
 */
import './App.scss';
import KadasterImg from './assets/Logo-NA.png';

/**
 * Netwerk
 */
import *  as Communicator from './network/Communicator';
import {Link, matchPath, withRouter} from "react-router-dom";

/**
 * Model
 */
import ResultatenHouder from './model/ResultatenHouder';
import ClickedResultaat from "./model/ClickedResultaat";
import {DefaultIcon, Icons} from "./components/Icons";
import ContextMenu from "./components/ContextMenu";

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            searchQuery: "",
            isFetching: false,
            results: new ResultatenHouder(),
            updateIng: false,
            clickedOnLayeredMap: undefined,
            objectsOverLayedOnMap: []
        };

        //subscribe aan de resulatatenHouder
        this.state.results.subscribe(this);
    }

    /**
     * Bij comonent did mount de kaart initaliseren en terug naar het hoofdscherm gaan
     **/
    componentDidMount() {
        this.mapInit();
        this.props.history.push('/');
    }

    /**
     * Initeert de kaart.
     **/
    mapInit = () => {
        //opties van de kaart
        this.map = L.map(
            'map',
            {
                minZoom: 8,
                center: [52.20936, 5.2],
                zoom: 8,
                maxBounds: [
                    [56, 10],
                    [49, 0],
                ]
            });

        //zet de kaart tile layer aka de brt
        L.tileLayer('https://geodata.nationaalgeoregister.nl/tiles/service/wmts/brtachtergrondkaart/EPSG:3857/{z}/{x}/{y}.png', {
            attribution: 'Kaartgegevens &copy; <a href="https://www.kadaster.nl/" target="_blank" rel = "noreferrer noopener">Kadaster</a> | <a href="https://www.verbeterdekaart.nl" target="_blank" rel = "noreferrer noopener">Verbeter de kaart</a> '
        }).addTo(this.map);

        //Wanneer je dubbelklikt op de kaart krijg dan alle locaties terug er om heen.
        this.map.on('contextmenu', this.handleRightMouseClick);

        //disable the zoom
        this.map.doubleClickZoom.disable();

        //zet de geojson layer en de functies die worden aangeroepen.
        //On each feature elke geojson object
        //point to layer bij elke marker
        this.geoJsonLayer = L.geoJSON([], {
            pointToLayer: this.addMarker,
        }).addTo(this.map);

        //de groep voor de markers
        this.markerGroup = L.markerClusterGroup({
            showCoverageOnHover: false
        });
        this.map.addLayer(this.markerGroup);

        //dit is voor mobiele applicatie. Als er gesleept wordt sluit dan het context menu.
        this.map.on('dragstart', () => {
            if (this.state.clickedOnLayeredMap) {
                this.setState({clickedOnLayeredMap: undefined});
            }
        });
    };

    /**
     * Krijg een hex van een kleur.
     * @param color
     * @param text bool of het tekst is of niet
     * @returns {string|undefined}
     */
    getHexFromColor(color, text) {
        if (color === "turqoise") {
            if (text) {
                return "#15a49f";
            } else {
                return "#3DCCC7";
            }
        } else if (color === "purple") {
            return "#7A306C";
        } else if (color === "green") {
            return "#489E17";
        } else if (color === "red") {
            return "#BA1200";
        } else if (color === "pink") {
            return "#FFD9CE";
        } else if (color === "blue") {
            return "#1B2CFF";
        } else if (color === "orange") {
            return "#FAA916";
        } else if (color === "yellow") {
            if (text) {
                return "#FAA916";
            } else {
                return "#F0F66E";
            }
        } else if (color === "mediumaquamarine") {
            return "#66CDAA";
        } else {
            if (text) {
                return "#000";
            } else {
                return undefined;
            }
        }
    }

    /**
     * Als je recht klikt op de kaart. Haal resulataten op en laat deze zien.
     **/
    handleRightMouseClick = (e) => {
        let latLong = e.latlng;

        //close pop ups van de kaart
        this.map.closePopup();
        this.popup = undefined;

        /**
         * Kijk of de gebruiker op de ObjectScreen zit
         */
        let match = matchPath(this.props.location.pathname, {
            path: "/result/:id",
            exact: true,
            strict: true
        });

        this.state.results.clearAll();

        /**
         * Als de gebruiker op een object screen zit ga dan terug.
         */
        if (match) {
            this.props.history.goBack();
        } else if (this.props.location.pathname !== "/result") {
            this.props.history.push(`/result`);
        }

        this.setState({
            isFetching: true,
            searchQuery: ""
        });

        /**
         * Krijg de bounds en geef deze ook door aan de communicator
         */
        let bounds = this.map.getBounds();
        Communicator.getFromCoordinates(latLong.lat, latLong.lng, bounds.getNorth(), bounds.getWest(), bounds.getSouth(), bounds.getEast()).then(res => {
            if (res !== undefined && res !== "error") {
                this.state.results.setDoubleResults(res);
                this.setState({
                    isFetching: false
                })

            }
        });
    };

    /**
     * De functie die de kaart aanroept elke keer als deze een marker wilt toevoegen.
     **/
    addMarker = (feature, latlng) => {
        let marker = L.marker(latlng,);
        this.markerGroup.addLayer(marker);

        //dit is de pop up en de html die tevoorschijn komt.
        marker.bindPopup(`<div class = "marker">
                    <b>Koper:</b> ${feature.properties.getKoper()}
                    <br/>
                    <b>Verkoper:</b> ${feature.properties.getVerkoper()}
                    <br/>
                    <span class="subTextMarker">${feature.properties.getAdres()}</span>
                    <div>
            `, {
            autoPan: false,
            closeButton: false
        });

        let onHover = function (e) {
            this.openPopup();
            this.setIcon(Icons);
        }.bind(marker);

        let onHoverOff = function (e) {
            this.closePopup();
            this.setIcon(DefaultIcon);
        }.bind(marker);

        //wanner je over de marker gaat laat de pop up zien
        marker.on('mouseover', onHover);
        //geef deze ook aan de feature zodat wanneer je over de resultaten lijst gaat het ook op de kaart te zien is.
        feature.properties._setOnHover(onHover);

        //wanneer je er van af gaat laat het weg
        marker.on('mouseout', onHoverOff);
        feature.properties._setOnHoverOff(onHoverOff);

        //wanneer je er op klikt ga naar die marker
        marker.on('click', () => {
            this.onClickItem(feature.properties)
        });
    };

    /**
     * Deze methode kan worden aangeroepen om het context menu te laten verdrwijnen.
     */
    resetClickedOnLayeredMap = () => {
        this.setState({
            clickedOnLayeredMap: undefined
        });
    };

    /**
     * Wanneer iemand op een resultaat klikt vor dan deze methode uit.
     **/
    onClickItem = (res) => {
        //maak een nieuwe clickedresultaat
        let clickedRes = new ClickedResultaat(res);

        this.setState({
            clickedOnLayeredMap: undefined
        });

        //zet de resultatenhouder de clickedresultaat.
        this.state.results.setClickedResult(clickedRes);

        if(res.getGeoJson()){
            //krijg de center van de plek waar je naartoe wilt.
            let center = this.getCenterGeoJson(res.getGeoJson());
            let zoom = this.map.getZoom();

            //als de gebruiker ingezoomt is, zoom dan niet uit.
            if (zoom < 10) {
                zoom = 10;
            }

            //zet de view.
            this.map.setView(center, zoom);
        }

        this.props.history.push(`/result/resultaat`);
    };

    /**
     * Krijg de center van een geojson object.
     **/
    getCenterGeoJson = (geojson) => {
        //kijk eerst naar de center
        var centroid = turf.center(geojson);

        try {
            //als deze niet in het geojson object ligt, gebruik dan de centroid
            if (!turf.booleanContains(geojson, centroid)) {
                centroid = turf.centroid(geojson);
            }
        } catch (e) {
        }

        //krijg de lat en long
        var lon = centroid.geometry.coordinates[0];
        var lat = centroid.geometry.coordinates[1];

        return [lat, lon];
    };

    /**
     * Wordt aangeroepen wanneer er iets wordt getype
     **/
    onSearchChange = (e, data) => {
        let text = data.value;

        this.map.closePopup();
        this.popup = undefined;

        //als de text iets heef
        if (text) {
            //zet dan eerst de state

            this.setState({
                searchQuery: text,
                isFetching: true
            });

            //haal vorige resultaten weg
            this.state.results.clearClickedResult();
            this.state.results.clearDoubleResults();

            //debounce zodat het pas wordt uitgevoerd wanneer de gebuiker stopt met typen.
            if (!this.debounceDoSearch) {
                this.debounceDoSearch = _.debounce(this.doSearch, 500);
            }

            //roep de methode aan die de zoek functie aanroept
            this.debounceDoSearch(text);

            //Als je op het hoofscherm bent ga dan naar de result screen
            if (this.props.location.pathname === "/") {
                this.props.history.push('/result')

                //als je niet op het resultaten scherm zit ga dan eentje terug
            } else if (this.props.location.pathname !== "/result") {
                this.props.history.goBack();
            }
        } else {
            //als de zoekbar text leeg is
            this.setState({
                searchQuery: "",
                isFetching: false
            });

            //verwijder alle resultaten
            this.state.results.clearAll();

            //ga terug naar het hoofdscherm
            if (this.props.location.pathname === "/result") {
                this.props.history.goBack();
            } else if (this.props.location.pathname !== '/') {
                this.props.history.go(-2);
            }
        }

        //centreer de kaart weer.
        if (this.map) {
            this.map.setView([52.20936, 5.2], 8);
        }
    };

    /**
     * Roept de communicator aan en haalt de resultaten op.
     **/
    doSearch = (text) => {
        /**
         * Roep de getMatch functie aan van de communicator
         **/
        Communicator.getMatch(text.trim(), this.state.currentSelected).then(res => {
            //als je een error terug krijgt, dan betekent dat je wel een antwoord hebt maar dat het niet werkt.

            if (res === "error") {
                this.setState({
                    isFetching: false
                })

                //als je undefined terug krijgt betekent het dat het een oude search query is.
                //Dus als het niet undefined is, betekent dat het het huidige search query is.
            } else if (res !== undefined) {
                this.setState({
                    isFetching: false
                });
                this.state.results.setResults(res);
            }
        });
    };

    /**
     * Wanneer er op het kruisje in de search bar wordt geklikt.
     **/
    handleDeleteClick = () => {
        this.onSearchChange({}, {value: ""});
    };

    /**
     * Wanneer er op de terug knop wordt geklikt in de applicatie aka <-- terug.
     **/
    handleOnBackButtonClick = () => {
        /**
         * Kijk of je op een resultaat scherm bent
         */
        let match = matchPath(this.props.location.pathname, {
            path: "/result/:id",
            exact: true,
            strict: true
        });

        if (this.props.location.pathname === "/result") {
            //Als je op de result screen bent ga dan terug naar het hoofdscherm
            this.handleDeleteClick();
        } else if (match) {
            //ga eerst een pagina terug
            this.props.history.goBack();

            //Als je op een geklikte resultaat scherm bent ga dan terug naar de result scherm
            this.state.results.clearClickedResult();
        }
    };

    /**
     * Deze methode wordt aangeropen elke keer als de resultaten houder wordt geupdate.
     */
    update = () => {
        let results = this.state.results;

        this.setState({
            results: results
        });

        /**
         * Soms wordt de update functie iets te vaak angereoepen dus debounce het
         */
        if (!this.updateMapDebounce) {
            this.updateMapDebounce = _.debounce(this.updateMap, 200);
        }

        this.updateMapDebounce(results);
    };


    /**
     * Update de kaart.
     **/
    updateMap = () => {
        let results = this.state.results;

        //haal eerst alle marker weg
        this.markerGroup.clearLayers();
        this.geoJsonLayer.clearLayers();

        //als er een geklikt resultaat is, render dan alleen deze
        if (this.state.results.getClickedResult()) {
            let feature = this.state.results.getClickedResult().getAsFeature();
            this.geoJsonLayer.addData(feature);
        } else if (this.state.results.getRightClickedRes().length > 0) {
            let geoJsonResults = results.getClickedAllObjectsAsFeature();
            this.geoJsonLayer.addData(geoJsonResults);
        } else {
            //anders render alle opgehaalde resultaten.
            if (this.state.searchQuery) {
                let geoJsonResults = results.getSearchedAllObjectsAsFeature();
                this.geoJsonLayer.addData(geoJsonResults);
            }
        }
    };

    /**
     * Wordt aangeroepen wanneer iemand op de zoekbalk klikt.
     */
    onFocus = () => {
        if (this.state.results.getRightClickedRes().length > 0) {
            this.handleDeleteClick();
        } else if (this.state.results.getClickedResult()) {
            this.handleOnBackButtonClick();
        }
    };

    getZoekResultatenAantal = () => {
        let aantalZoekResultaten;

        if (this.state.results.getClickedResult()) {

        } else if (this.state.results.getRightClickedRes().length > 0) {
            aantalZoekResultaten = this.state.results.getRightClickedRes().length;
        } else {
            aantalZoekResultaten = this.state.results.getResults().length;
        }

        if(aantalZoekResultaten > 989){
            aantalZoekResultaten = 900 + "+";
        }

        return aantalZoekResultaten;
    }

    render() {
        let aantalZoekResultaten = this.getZoekResultatenAantal();

        let icon;
        let className;

        if (this.state.searchQuery || this.state.results.getRightClickedRes().length > 0) {
            icon = <Icon name='delete' link onClick={this.handleDeleteClick}/>;
        } else {
            icon = <Icon name='search'/>;
        }

        if (!this.state.updateIng) {
            className = "mapHolder";
        } else {
            className = "mapHolderLoading"
        }

        return (
            <section className="App">
                <div className="brtInfo">
                    <Link to="/" onClick={() => {
                        this.handleDeleteClick();
                    }}>
                        <div className="header">
                            <h1>Verkaufsbücher</h1><img src={KadasterImg} alt="kadaster logo"/>
                        </div>
                    </Link>
                    <div className="searchBar">
                        <Search input={{fluid: true}}
                                value={this.state.results.getRightClickedRes().length > 1 ? "[ Kaartresultaten worden getoond ]" : this.state.searchQuery}
                                noResultsMessage="Geen resultaat"
                                icon={icon}
                                onSearchChange={this.onSearchChange}
                                open={false}
                                onFocus={this.onFocus}
                                placeholder ={"Achternaam, straatnaam, plaatsnaam?"}
                        />
                    </div>
                    <div className="resultsContainer">
                        <NavBar
                            loading={this.state.isFetching}
                            onBack={this.handleOnBackButtonClick}
                            aantalZoekResultaten = {aantalZoekResultaten}
                        />
                        <div className="loaderDiv">
                            <Loader
                                loading={this.state.isFetching}
                            />
                        </div>
                        <div className="resultPartContainer">
                            <Routes
                                res={this.state.results}
                                clickedResult={this.state.results.getClickedResult()}
                                onClickItem={this.onClickItem}
                                getHexFromColor={this.getHexFromColor}
                            />
                        </div>
                    </div>
                    <div className="footer">
                        <a target="_blank" rel="noreferrer noopener">Dit project is een samenwerking tussen het Nationaal Archief en het Kadaster.</a>
                    </div>
                </div>
                <div className={className} onContextMenu={(e) => e.preventDefault()}>
                    <Loader
                        loading={this.state.updateIng}
                    />
                    <div id="map"/>
                </div>
                <ContextMenu
                    coordinates={this.state.clickedOnLayeredMap}
                    resetCoordinates={this.resetClickedOnLayeredMap}
                    objectsOverLayedOnMap={this.state.objectsOverLayedOnMap}
                    getHexFromColor={this.getHexFromColor}
                />
            </section>
        )
    }
}

export default withRouter(App);
