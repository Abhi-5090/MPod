import React from 'react';
import PropTypes from 'prop-types';
import { Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper';
import Banneritem from '../banner-item2';

Banner.propTypes = {
    data: PropTypes.array,
};

function Banner(props) {
    const { data } = props;
    return (
        <section className="tf-section flat-help home2 style2 slider slider2 style-home2" style={{ height: "1150px"}} >
            <Swiper className='swiper-container show-slider2 mainslider home'>
                {
                    data.slice(3, 4).map(item => (
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