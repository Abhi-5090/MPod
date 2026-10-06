import React from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
Brand.propTypes = {
    item: PropTypes.object,
};


function Brand(props) {
    const {item} = props;

    return (
        <div className="slogan-logo">
            <Link to="#">
                <img src={item.img} alt="images" />
            </Link>
     </div>
    );
}

export default Brand;