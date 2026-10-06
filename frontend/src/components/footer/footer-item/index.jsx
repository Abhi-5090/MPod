import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
Footer.propTypes = {
    item: PropTypes.object,
};

function Footer(props) {
    const {item} = props;

    return (
        <div className="col-lg-2 col-md-3 col-6">
            <div className={`widget widget-menu ${item.classAction}`}>
                <h3 className="title-widget">{item.title}</h3>
                <ul className="link-style-1">
                    {
                        item.listlink.map(text => (
                            <li key={text.id}>
                                <Link to={text.link}>{text.text}</Link>
                            </li>
                        ))
                    }
                </ul>
            </div>
        </div>
    );
}

export default Footer;