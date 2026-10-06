import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../button/button-st1';
Banner.propTypes = {
    item: PropTypes.object,
};


function Banner(props) {
    const {item} = props;

    return (
        <div className="themes-container">
            <div className="wrap-heading flat-slider flex j-content-between">
                <div className="content">                                       	
                    <h1 className="heading">{item.title}<span className="s2">{item.title2}</span>{item.title3} <span className="tf-text style s1">{item.title4}</span>  </h1>
                    <p className="sub-heading">{item.subtitle}</p>
                    <div className="flat-bt-slider flex style2">
                        <Button title='Explore More' addclass='sc-button style-1 fl-button' path='/explore' />
                        <Button title='Collect NFT' addclass='sc-button style-2 btn-5' path='/liveAuction' />
                    </div>                                 
                </div>
                <div className="image">
                    <img className="mark-slider-01 animate-up" src={item.img1} alt="" />                                   
                    <img className="absolute mark-slider-02 animate-zoom" src={item.img2} alt="" />
                    <div className="img-slider">
                        <div className="box-img flat-img flex">
                            <div className="img-1"><img src={item.img3}alt="" /></div>
                            <div className="img-2"><img src={item.img4} alt="" /> </div>                     
                        </div>
                        <div className="bg-color"></div>
                    </div>
                </div>
            </div>                                  
        </div>	
    );
}

export default Banner;