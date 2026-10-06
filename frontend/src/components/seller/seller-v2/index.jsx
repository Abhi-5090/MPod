import React , { useState } from 'react';
import PropTypes from 'prop-types';
import Selleritem from '../seller-item2';
Seller.propTypes = {
    data : PropTypes.array,
};

function Seller (props) {
    const {data} = props;

    const [dataTitle] = useState(
        {   
            sub1 : 'Empowering 230,000 +Businesses with Innovation',
            sub2 : 'Top Creators',
            sub3 : 'Digital NFT Marketplace.',
        }
    )
    return (
        <div className="flat-top-seller home2">
        <div className="themes-container2 style-container">
        <div className="container">
            <div className="row">                  
                {
                    data.slice(0,4).map(item =>(
                        <Selleritem key={item.id} item={item}/>
                    ))
                }                     
                <div className="col-lg-12">
                    <h3 className="title center font fw-6 mt-58 text-t text-color-5">{dataTitle.sub1} <span className="text-color-3">{dataTitle.sub2}</span>{dataTitle.sub3} </h3>
                </div>
            </div>
        </div>
        </div>
    </div>
    );
}

export default Seller;