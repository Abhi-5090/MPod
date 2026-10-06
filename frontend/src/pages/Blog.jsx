import React from 'react';
import '../scss/components/section.scss';
import Header from '.././components/header/header.jsx';
import PageTitle from '../components/page-title/page-title-v1';
import Flathelp from '../components/flat-help';
import Footer from '../components/footer/footer-v1';
import dataFooter from '../assets/fake-data/data-footer';
import Bottom from '../components/bottom';
import BlogItem from '.././components/blog/blog-item2';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation , Grid  } from 'swiper';
import dataBlog from '../assets/fake-data/data-blog';
import { Link } from "react-router-dom";

function Blog(props) {

    return (
        <div className='wrapper-style' id='wrapper'>
            {<Header />}
            <PageTitle title='Blog Page'  />
            <div className="tf-section dark-style2 ">
                <div className="container">
                    <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12">
                        <Swiper
                            className='swiper-container carousel-blog style-2 btn-collection2'
                            modules={[Navigation , Grid]}
                            spaceBetween={30}
                            navigation
                            grid={{
                                "rows": 2
                            }}
                            breakpoints={{
                                576: {
                                    slidesPerView: 2,
                                    slidesPerColumn: 2,
                                    spaceBetween: 30,
                                },
                                992: {
                                    slidesPerView: 3,
                                    slidesPerColumn: 2,
                                    spaceBetween: 30,
                                },
                            }}
                            >
                            {
                                dataBlog.slice(0,12).map (item => (
                                    <SwiperSlide key={item.id}>
                                        <BlogItem key={item.id} item={item} /> 
                                    </SwiperSlide>
                                    
                                ))
                            }
                        </Swiper> 
                        <div className="themesflat-pagination clearfix mtop-42 w60">
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
            </div>
            {<Flathelp />}
            {<Footer data={dataFooter}/>}
            {<Bottom classection='widget-social-footer'/>}
        </div>
    );
}

export default Blog;