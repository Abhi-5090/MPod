import React from 'react';
import PropTypes from 'prop-types';
import { Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper';
import Interview from '../interview';

Banner.propTypes = {
    data: PropTypes.array,
};

function Banner(props) {
    const { data } = props;
    // console.log(data)
    return (
        <section className="tf-section flat-help home2 style2 slider slider2 style-home2" style={{ height: "1150px"}} >
            <Swiper className='swiper-container show-slider2 mainslider home'>
                {/* {
                    data.slice(3, 4).map(item => ( */}
                        <SwiperSlide >
                            <Interview item={data} />
                        </SwiperSlide>
                    {/* ))
                } */}

            </Swiper>
        </section>
    );
}

export default Banner;