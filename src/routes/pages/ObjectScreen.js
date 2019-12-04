import React from 'react';
import * as Communicator from '../../network/Communicator';

class ObjectScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            res: undefined
        }
    }

    componentDidMount() {
        this.getClickedResultinfo(this.props.clickedResult);
    }

    /**
     * Haal alle gegevens op van de clickedResult.
     * @param url
     */
    getClickedResultinfo = (url) => {
        if (url) {
            Communicator.getAllAttribtes(this.props.clickedResult).then(res => {
                this.setState({
                    res: this.props.clickedResult
                })
            });
        }
    }

    render() {
        let res = this.state.res;

        let adres;
        let place;
        let tableNamen;
        let tableRest;

        if (res) {
            adres = (<h1>{res.getAdres()}</h1>);
            place = (<h3>{res.getPlace()}</h3>);

            let kopers = (<tr>
                <td><b>Kopers:</b></td>
                <td>Onbekend</td>
            </tr>);

            if (res.getBuyers().length > 0) {
                let strings = res.getBuyers().map(res => {
                    return (<li key={res.getName()}>
                            {res.getName() || res.getName() !== "" ? res.getName() : "Onbekend"}&nbsp;
                            {res.getLocation() ? "(" + res.getLocation() + ")" : ""}
                        </li>
                    );
                });

                kopers = (
                    <tr>
                        <td className={"verkoperKoper"}><b>Kopers:</b></td>
                        <td><ul>{strings}</ul></td>
                    </tr>
                )
            }

            let verkopers = (<tr>
                <td><b>Verkopers:</b></td>
                <td>Onbekend</td>
            </tr>);

            if (res.getSellers().length > 0) {
                let strings = res.getSellers().map(res => {
                    return (<li key={res.getName()}>
                            {res.getName() || res.getName() !== "" ? res.getName() : "Onbekend"}&nbsp;
                            {res.getLocation() ? "(" + res.getLocation() + ")" : ""}
                        </li>
                    );
                });

                verkopers = (
                    <tr>
                        <td className={"verkoperKoper"}><b>Verkopers:</b></td>
                        <td><ul>{strings}</ul></td>
                    </tr>
                )
            }

            tableNamen = (
                <div>
                    <table className="namenTable">
                        <tbody>
                        {kopers}
                        {verkopers}
                        </tbody>
                    </table>
                    <hr/>
                </div>
            );


            let verkoopprijs;
            let koopdatum;
            let ertovf;

            if(res.getDate()){
                koopdatum = (<tr>
                        <td><b>Definitieve koopdatum:</b></td>
                        <td>{res.getDate()}</td>
                    </tr>
                )
            }

            if(res.getPrice){
                verkoopprijs = (<tr>
                    <td><b>Verkoopprijs:</b></td>
                    <td>&#402; {formatNumber(res.getPrice())}</td>
                </tr>
                );

                ertovf = (<tr>
                        <td><b>&euro; 2018 tov &#402; 1944:</b></td>
                        <td>&euro; {formatNumber(res.getPrice()*6.37)}</td>
                    </tr>
                );
            }

            tableRest = (
                <table className="attributeSectionObjectScreen">
                    <tbody>
                    {koopdatum}
                    {verkoopprijs}
                    {ertovf}
                    </tbody>
                </table>
            )
        }

        return (
            <div className="objectScreen">
                {adres}
                {place}
                {tableNamen}
                {tableRest}
            </div>
        )
    }
}

function formatNumber(num) {
    num = parseInt(num).toString();
    return num.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + ",-";
}
export default ObjectScreen;