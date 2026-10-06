import React , { useState } from 'react';
import PropTypes from 'prop-types';
import FriendlyItem from './friendly-item';

import img1 from '../../assets/images/icon/icon-friendly-1.svg';
import img2 from '../../assets/images/icon/icon-friendly-2.svg';
import img3 from '../../assets/images/icon/icon-friendly-3.svg';

Friendly.propTypes = {
    data : PropTypes.array,
};

function Friendly (props) {

    const [dataItem] = useState(
        [
            {
                id: 1,
                img: img1,
                title:'Decentralized Platform.'
            },
            {
                id: 2,
                img: img2,
                title:'Crowd Meet Wisdom.'
            },
            {
                id: 3,
                img: img3,
                title:'Rewards Meachanism.'
            },
        ]
    )

    return (
        <div className="flat-friendly">
            <div className="themes-container2 wrap-friendly">
                <div className="row">  
                    <div className="col-lg-4">
                        <div className="box-img animate-up">
                            <img src={require ('../../assets/images/mark/friendly-01.png')} alt="Nufti"/>
                        </div>
                    </div>
                    <div className="col-lg-8 col-md-12">
                        <ul className="flex">
                            {
                                dataItem.map (item => (
                                    <FriendlyItem key={item.id} item={item}/>
                                ))
                            }
                        </ul>
                    </div>                        
                </div>
            </div>
        </div>
    );
}

export default Friendly;