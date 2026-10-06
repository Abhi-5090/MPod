import React from 'react';
import PropTypes from 'prop-types';
import BrandItem from '../brand-item';
import { Swiper, SwiperSlide } from 'swiper/react';
Brand.propTypes = {
    data : PropTypes.array,
};

function Brand (props) {
    const {data} = props;
    const {classection} = props;

    return (
        <div className={`${classection}`}>
        <div className="container">
            <div className="row">                  
                <div className="col-lg-12 col-md-12">
                    <div className="brand-slider">
                        <Swiper
                            className='swiper-container carousel-2'
                            spaceBetween={30}
                            breakpoints={{
                                768: {
                                    slidesPerView: 4,
                                    spaceBetween: 30,
                                },
                                1024: {
                                    slidesPerView: 6,
                                    spaceBetween: 92,
                                },
                                }}
                            >
                            {
                                data.slice(0,8).map(item => (
                                    <SwiperSlide key={item.id}>
                                        <BrandItem item={item} />
                                    </SwiperSlide>
                                ))
                            } 
                        </Swiper>
                    </div>            
                </div>
            </div>
        </div>
    </div>
    );
}

export default Brand;