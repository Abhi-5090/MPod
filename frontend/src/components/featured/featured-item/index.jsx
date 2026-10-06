import React from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
Featured.propTypes = {
    item: PropTypes.object,
};


function Featured(props) {
    const {item} = props;

    return (
        <div className="col-lg-4 col-md-4">
            <div className="wrap-featured center">
                <div className="box-img">
                    <img src={item.img} alt="" />
                </div>
                <div className="content">
                    <h3 className="fw-4"><Link to="/connectwallet">{item.title}</Link></h3>
                    <p>{item.desc}</p>
                </div>
            </div>
        </div>
    );
}

export default Featured;