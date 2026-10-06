import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import '../styles.scss';


Button.propTypes = {
    title: PropTypes.string,
    path: PropTypes.string,
};

function Button(props) {
    const {title , path , onClick, addclass} = props;
    return (
        <Link className={`sc-button ${addclass}`} to={path} onClick={onClick}>                                   
            <span>{title}</span>
        </Link>
    );
}

export default Button;