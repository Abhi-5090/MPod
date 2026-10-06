import React from 'react';
import PropTypes from 'prop-types';
import FeaturedItem from '../featured-item';
Featured.propTypes = {
    data : PropTypes.array,
};

function Featured (props) {
    const {data} = props;
    return (
        <div className="tf-section flat-featured home2 home3">
                <div className="container">
                    <div className="row">
                        {
                            data.slice(0,4).map(item =>(
                                <FeaturedItem key={item.id} item={item}/>
                            ))
                        }
                    </div>
                </div>
            </div>
    );
}

export default Featured;