import React , {useState,Fragment } from 'react';
import PropTypes from 'prop-types';
import { Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation} from 'swiper';
import {Link} from 'react-router-dom';
import CardModal from '../../CardModal';
Liveauction.propTypes = {
    data : PropTypes.array,
};

function Liveauction (props) {
    const [modalShow, setModalShow] = useState(false);
    const {data} = props;
    const [dataTitle] = useState(
        {   
            title: 'Explore Assets NFTS',
            desc : 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration.',
        }
    )
    return (
        <Fragment>
            <div className="tf-section flat-explore flat-auctions mtop-3 home2 ">
                <div className="container">
                    <div className="row">                  
                        <div className="col-lg-6 col-sm-12">
                            <div className="heading-section2 style">
                                <h2 className="fw-5">{dataTitle.title}</h2>
                                <p>{dataTitle.desc}</p>
                            </div>
                        </div>
                        <div className="col-lg-12">
                            <Swiper
                                    className='swiper-container carousel-5 auctions show-slider3 btn-collection'
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
                                            slidesPerView: 4,
                                            spaceBetween: 30,
                                        },
                                    }}
                                >
                                {
                                    data.slice(6,12).map(item => (
                                        <SwiperSlide key={item.id}>
                                             <div className="sc-card-product sc-card-article blog-article">
                                                <div className="card-media flat-img">
                                                    <Link to="/liveAuctionDetails">
                                                        <img src={item.img} alt="img" />
                                                    </Link>                                                                                                                                                                                                     
                                                </div>  
                                                <div className="content">
                                                    <h6 className="tags">{item.tags}</h6>  
                                                    <h3><Link to="/liveAuctionDetails">{item.title}</Link></h3> 
                                                    <div className="meta-info mb-17">
                                                        <div className="author">
                                                            <div className="avatar">
                                                                <img src={item.imgauthor} alt="" />
                                                                <img className='check' src={item.icon1} alt="Nufti"/>
                                                            </div>
                                                            <div className="info">
                                                                <h5> By<Link className="text-color-3" to="/author">{item.author}</Link> </h5>
                                                                <div className="date"> In <span>{item.date}</span></div>                                           
                                                            </div>
                                                        </div>                                  
                                                    </div>  
                                                    <div className="meta-price flex-one">                                              
                                                        <div className="price flex">
                                                            <img src={item.icon2} alt="Nufti"/>
                                                            <div className="title-price">{item.titleprice}</div>
                                                        </div>
                                                        <div className="button-place-bid">
                                                            <Link to="#" data-toggle="modal" data-target="#popup_bid" className="sc-button btn-3" onClick={() => setModalShow(true)}><span>{item.btn}</span></Link>
                                                        </div>
                                                    </div>
                                                </div>    	
                                            </div>  
                                        </SwiperSlide>
                                    ))
                                }
                                
                            </Swiper>  
                        </div>
                    </div>
                </div>
            </div>
            <CardModal
                show={modalShow}
                onHide={() => setModalShow(false)}
            />
        </Fragment>
        
    );
}

export default Liveauction;