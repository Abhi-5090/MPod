import React from 'react';
import PropTypes from 'prop-types';
Friendly.propTypes = {
    item: PropTypes.object,
};


function Friendly(props) {
    const {item} = props;

    return (
        <li>
            <img className="img-icon" src={item.img} alt="" />
            <div className={`title-friendly fs-24 ${item.classAction}`}>{item.title}</div>
        </li>
    );
}

export default Friendly;