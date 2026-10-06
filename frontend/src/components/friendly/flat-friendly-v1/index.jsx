import React from 'react';
import PropTypes from 'prop-types';
import FriendlyItem from '../friendly-item';


Friendly.propTypes = {
    data : PropTypes.array,
};

function Friendly (props) {
    const {data} = props;
    return (
        <div className="flat-friendly pb-120 home2">
        <div className="themes-container3 wrap-friendly">
            <div className="row">  
                <div className="col-lg-3 relative">
                    <div className="box-img absolute animate-up">
                        <img src={require ('../../../assets/images/mark/friendly-1.png')} alt="Nufti"/>
                    </div>
                </div>
                <div className="col-lg-9 col-md-12">
                    <ul className="flex">
                        {
                            data.slice(0,3).map (item => (
                                <FriendlyItem key={item.id} item={item}/>
                            ))
                        }
                    </ul>
                    <div className="img absolute">
                        <img src={require ('../../../assets/images/mark/user-friendly.png')} alt="Nufti"/>
                    </div>
                </div>                        
            </div>
        </div>
    </div>
    );
}

export default Friendly;