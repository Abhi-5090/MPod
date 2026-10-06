import React from 'react';
import PropTypes from 'prop-types';
import { Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation} from 'swiper';
import RulesItem from '../rules-item3';

Banner.propTypes = {
    data : PropTypes.array,
};

function Banner (props) {
    const {data} = props;
    return (
        <section className="flat-title-page style2 slider style-home2 style-home3">
                    <Swiper
                        className='swiper-container show-slider show-slider2 mainslider home'
                        // modules={[Navigation, Autoplay ]}
                        spaceBetween={30}
                        // navigation
                        // breakpoints={{
                        //         1300: {
                        //         slidesPerView: 1,
                        //         spaceBetween: 30,
                        //     },
                        // }}
                        >
                        {
                        //  data.slice(6,9).map(item => (
                            <SwiperSlide>
                                <RulesItem item={data} />
                            </SwiperSlide>
                        // ))
                    }  
                    </Swiper>                  
    </section>
    );
}

export default Banner;