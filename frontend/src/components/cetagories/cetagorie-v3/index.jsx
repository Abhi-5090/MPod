import React , { useState } from 'react';
import PropTypes from 'prop-types';
import Categoryitem from '../cetagorie-item2';

Category.propTypes = {
    data : PropTypes.array,
};

function Category (props) {
    const {data} = props;
    const [dataTitle] = useState(
        {   
            title : 'Explore Assets NFTS',
            desc: 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour.',
        }
    )
    return (
        <div className="flat-cetagories2 home2 home3">
        <div className="themes-container2 style-container">
        <div className="container">
            <div className="row">  
                <div className="col-lg-12">
                    <div className="heading-section center">
                        <h2>{dataTitle.title}</h2>
                        <p>{dataTitle.desc}</p>
                    </div>
                </div>
                {
                    data.slice(9,15).map (item => (
                        <Categoryitem key={item.id} item={item}/>
                    ))
                }
            </div>
        </div>
        </div>
    </div>
    );
}

export default Category;