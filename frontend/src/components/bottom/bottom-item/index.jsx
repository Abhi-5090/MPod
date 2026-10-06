import React from 'react';
import PropTypes from 'prop-types';
import { Link  } from 'react-router-dom';

Bottom.propTypes = {
    item: PropTypes.object,
};

function Bottom(props) {
    const {item} = props;

    return (
        <li>
            <div className="number"><h3>{item.number}</h3></div>
            <h5><Link to={item.link}>{item.title}</Link></h5>
            <p>{item.text}</p>
        </li>
    );
}

export default Bottom;