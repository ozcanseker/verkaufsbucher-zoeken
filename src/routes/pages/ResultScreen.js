import React from 'react';
import Resultaat from "../../model/Resultaat";

class ResultScreen extends React.Component {
    render() {
        let results = this.props.res.getRightClickedRes().length > 0 ? this.props.res.getRightClickedRes() : this.props.res.getResults();

        let elements = results.map(res => {
            let pElementKoper = (<p className= "hoofdText">&nbsp;</p>);
            let pElementVerkoper = (<p className= "hoofdText">&nbsp;</p>);
            let pElementAdress = <p className= "subText">&nbsp;</p>;

            if(res.getKoper()){
                pElementKoper = (<p className= "hoofdText"><b>Koper</b> : {res.getKoper()}</p>);
            }

            if(res.getVerkoper()){
                pElementVerkoper = (<p className= "hoofdText">
                    <b>Verkoper</b> : {res.getVerkoper()}
                </p>);
            }

            if(res.getAdres()){
                pElementAdress = (<p className= "subText">
                    {res.getAdres()}
                </p>);
            }

            return (<li key={res.getUrl()}
                        className="liResultScreen"
                        onClick={() => {this.props.onClickItem(res)}}
                        onMouseEnter={() => {res._onHover()}}
                        onMouseLeave={() => {res._onHoverOff()}}>
                {pElementVerkoper}
                {pElementKoper}
                {pElementAdress}
            </li>)
        });

        return(
            <div className="homeScreen">
                <ul>
                    {elements}
                </ul>
            </div>
        )
    }
}

export default ResultScreen;