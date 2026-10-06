import React from 'react';
import PropTypes from 'prop-types';
import FriendlyItem from '../friendly-item';

Friendly.propTypes = {
    data : PropTypes.array,
};

function Friendly (props) {
    const {data} = props;


    return (
        <div className="flat-friendly home2 home3">
            <div className="container">
                <div className="row">  
                    <div className="col-lg-12 col-md-12">
                        <ul className="flex">
                        {
                            data.slice(3,7).map (item => (
                                <FriendlyItem key={item.id} item={item}/>
                            ))
                        }
                        </ul>
                    </div>                        
                </div>
            </div>
        </div>

    );
}

export default Friendly;