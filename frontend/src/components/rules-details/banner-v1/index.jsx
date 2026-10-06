import React from 'react';
import PropTypes from 'prop-types';
import { Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation} from 'swiper';
import Banneritem from '../banner-item';

Banner.propTypes = {
    data : PropTypes.array,
};

function Banner (props) {
    const {data} = props;
    return (
        <section className="flat-title-page style2 slider">
                    {/* <img src={require ('../../../assets/images/mark/mark-header-04.png')} alt="Nufti" className="absolute mark-page"/>
                    <img src={require ('../../../assets/images/mark/mark-header-01.png')} alt="Nufti" className="absolute mark-page2 animate-rotate"/>
                    <img src={require ('../../../assets/images/mark/mark-header-02.png')} alt="Nufti" className="absolute mark-page3"/>
                    <img src={require ('../../../assets/images/mark/mark-header-03.png')} alt="Nufti" className="absolute mark-page4"/>
                    <img src={require ('../../../assets/images/mark/mark-header-05.png')} alt="Nufti" className="absolute mark-page5"/>
                    <img src={require ('../../../assets/images/mark/mark-header-06.png')} alt="Nufti" className="absolute mark-page9"/>
                    <img src={require ('../../../assets/images/mark/mark-slider-4.png')} alt="Nufti" className="absolute mark-page8 animate-up"/> */}
                    <Swiper
                                    className='swiper-container mainslider home'
                                    modules={[Navigation, Autoplay ]}
                                    spaceBetween={30}
                                    navigation
                                    breakpoints={{
                                        1300: {
                                            slidesPerView: 1,
                                            spaceBetween: 30,
                                        },
                                    }}
                                >
                                {
                                    data.slice(0,3).map(item => (
                                        <SwiperSlide key={item.id}>
                                            <Banneritem item={item} />
                                        </SwiperSlide>
                                    ))
                                }
                                
                    </Swiper>                  
    </section>
    );
}

export default Banner;