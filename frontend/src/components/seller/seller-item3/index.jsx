import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
Seller.propTypes = {
    item: PropTypes.object,
};


function Seller(props) {
    const {item} = props;

    return (
        <div className="wrap-seller center">
            <div className="img-box flat-img">
                <div className="img-author"><img src={item.img} alt="" /></div>
                <img className="check" src={item.icon1} alt="" />
            </div>
            <div className="content">
                <h3><Link to="/profile">{item.title}</Link></h3>
                <div className="price flex">
                    <img src={item.icon2} alt=""/>
                    <div className="title-price fs-16">{item.price}</div>
                </div>
                <div className="button-follow">
                    <Link to="/profile" className="sc-button btn-6"><span>{item.btn}</span></Link>                     
                </div>
            </div>
        </div>
    );
}

export default Seller;