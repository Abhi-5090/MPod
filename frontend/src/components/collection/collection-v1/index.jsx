import React , { useState } from 'react';
import PropTypes from 'prop-types';
import CollectionItem from '../collection-item';
import { Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation} from 'swiper';
Collection.propTypes = {
    data : PropTypes.array,
};

function Collection (props) {
    const {data} = props;
    const {classection} = props;

    const [dataTitle] = useState(
        {   
            title : 'Popular Collection',
            desc : 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration.',
        }
    )
    return (
        <div className={`${classection}`}>
        <div className="container">
            <div className="row">                  
                <div className="col-lg-6 col-sm-12">
                    <div className="heading-section2">
                        <h2 className="fw-5">{dataTitle.title}</h2>
                        <p>{dataTitle.desc}</p>
                    </div>
                </div>
                <div className="col-lg-12 col-md-12 col-sm-12">
                <Swiper
                                    className='swiper-container carousel-1 show-slider show-boder btn-collection'
                                    modules={[Navigation, Autoplay ]}
                                    spaceBetween={30}
                                    navigation
                                    breakpoints={{
                                        768: {
                                            slidesPerView: 2,
                                            spaceBetween: 30,
                                        },
                                        1024: {
                                            slidesPerView: 3,
                                            spaceBetween: 30,
                                        },
                                        1300: {
                                            slidesPerView: 3,
                                            spaceBetween: 30,
                                        },
                                    }}
                                >
                                {
                                    data.slice(0,5).map(item => (
                                        <SwiperSlide key={item.id}>
                                            <CollectionItem item={item} />
                                        </SwiperSlide>
                                    ))
                                }
                                
                            </Swiper>
                </div>
            </div>
        </div>
    </div>
    );
}

export default Collection;