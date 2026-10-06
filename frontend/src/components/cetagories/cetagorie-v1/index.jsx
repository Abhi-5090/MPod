import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../button/button-st1';
import Categoryitem from '../cetagorie-item';

Cetagorie.propTypes = {
    data : PropTypes.array,
};

function Cetagorie (props) {
    const {data} = props;
    return (
        <div className="tf-section flat-cetagories style">
        <div className="themes-container">
            <div className="row">
                <div className="col-lg-12 col-md-12">                    
                    <div className="wrap-cetagories">
                        {
                            data.slice(0,9).map (item => (
                                <Categoryitem key={item.id} item={item} />
                            ))
                        }      
                        <div className="cetagories-button flex">
                            <div className="sc-btn-button">
                                <Button title='View All More' addclass='btn-2' path='#' />
                            </div>                 
                        </div>                    
                    </div>                        
                </div>
            </div>
        </div>
    </div>
    );
}

export default Cetagorie;