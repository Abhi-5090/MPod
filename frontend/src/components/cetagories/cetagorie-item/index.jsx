import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
Category.propTypes = {
    item: PropTypes.object,
};


function Category(props) {
    const {item} = props;

    return (
        <div className="cetagories flex">
            <div className="content">
                <h3><Link to="/explore">{item.title}</Link></h3>
                <p className="font-2">{item.desc}</p>
            </div>
            <img src={item.img} alt="img" />
        </div>    
    );
}

export default Category;