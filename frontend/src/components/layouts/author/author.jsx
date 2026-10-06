import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation , Grid  } from 'swiper';
const Author = (props) => {
  const data = props.data;


  return (
    <Fragment>
            <div className="tf-section flat-top-seller flat-auctions dark-style page">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12 col-md-12">
                        <Swiper
                            className='swiper-container carousel-7 show-shadow btn-collection2'
                            modules={[Navigation , Grid]}
                            spaceBetween={30}
                            navigation
                            grid={{
                                "rows": 2
                            }}
                            breakpoints={{
                                576: {
                                    slidesPerView: 2,
                                    spaceBetween: 30,
                                },
                                992: {
                                    slidesPerView: 3,
                                    spaceBetween: 30,
                                },
                                1200: {
                                    slidesPerView: 6,
                                    spaceBetween: 30,
                                },
                            }}
                            >
                            {
                                data.slice(0,18).map (item => (
                                    <SwiperSlide key={item.id}>
                                        {
                                            <div className="wrap-seller center">
                                                <div className="img-box flat-img">
                                                    <div className="img-author"><img src={item.img} alt="" /></div>
                                                    <img className="check" src={item.icon1} alt="" />
                                                </div>
                                                <div className="content">
                                                    <h3><Link to="/profile">{item.title}</Link></h3>
                                                    <div className="price flex">
                                                        <img src={item.icon2} alt=""/>
                                                        <div className="title-price fs-16">{item.price}</div>
                                                    </div>
                                                    <div className="button-follow">
                                                        <Link to="/profile" className="sc-button btn-6"><span>{item.btn}</span></Link>  
                                                    </div>
                                                </div>
                                            </div> 
                                        }
                                    </SwiperSlide>
                                    
                                ))
                            }
                        </Swiper>    
                        </div>
                        <div className="themesflat-pagination clearfix mtop-26 w60">
                            <ul>
                                <li><Link to="#" className="page-numbers">01</Link></li>
                                <li><Link to="#" className="page-numbers current">02</Link></li>
                                <li><Link to="#" className="page-numbers">03</Link></li>
                                <li><Link to="#" className="page-numbers">04</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
    </Fragment>
  );
};


export default Author;
