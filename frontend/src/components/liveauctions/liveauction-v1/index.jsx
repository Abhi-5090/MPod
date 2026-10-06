import React , { useEffect , useState,Fragment } from 'react';
import PropTypes from 'prop-types';
import Button from '../../button/button-st1';
import {Link} from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import CardModal from '../../CardModal';

Liveauction.propTypes = {
    data : PropTypes.array,
};

function Liveauction (props) {

    const [modalShow, setModalShow] = useState(false);
    
    const [countdownDate] = useState(new Date('7/30/2022').getTime());
    const [state, setState] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        setInterval(() => setNewTime(), 1000);
    },);

    const setNewTime = () => {
        if (countdownDate) {
        const currentTime = new Date().getTime();

        const distanceToDate = countdownDate - currentTime;

        let days = Math.floor(distanceToDate / (1000 * 60 * 60 * 24));
        let hours = Math.floor(
            (distanceToDate % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        let minutes = Math.floor(
            (distanceToDate % (1000 * 60 * 60)) / (1000 * 60),
        );
        let seconds = Math.floor((distanceToDate % (1000 * 60)) / 1000);

        const numbersToAddZeroTo = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        days = `${days}`;
        if (numbersToAddZeroTo.includes(hours)) {
            hours = `0${hours}`;
        } else if (numbersToAddZeroTo.includes(minutes)) {
            minutes = `0${minutes}`;
        } else if (numbersToAddZeroTo.includes(seconds)) {
            seconds = `0${seconds}`;
        }

        setState({ days: days, hours: hours, minutes, seconds });
        }
    };

    const {data} = props;
    const [dataTitle] = useState(
        {   
            title : 'Live Auctions',
            desc: 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour.',
        }
    )
    return (
        <Fragment>
            <div className="flat-auctions live-auctions pb-120 seller style2 ">
                <div className="container">
                    <div className="row help-row">                  
                        <div className="col-lg-12">
                            <div className="heading-section center">
                                <h2>{dataTitle.title}</h2>
                                <p>{dataTitle.desc}</p>
                            </div>
                        </div>
                        <div className="col-lg-12">
                        <Swiper
                            className='swiper-container show-shadow carousel auctions'
                            spaceBetween={30}
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
                                data.slice(0,4).map(item => (
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
                                                            <Link to="#" className="sc-button btn-3" onClick={() => setModalShow(true)}><span>{item.btn}</span></Link>
                                                        </div>
                                                    </div>
                                                    <div className="featured-countdown">
                                                        <h4 className="flex-one"><span className="title-countdown">{item.titlecountdown}</span>
                                                        <div className="js-countdown">
                                                                    <div className="countdown__timer">
                                                                        <div className="countdown__item">
                                                                            {state.days || '0'}
                                                                        </div>
                                                                        <div className="countdown__item countdownhours">
                                                                        {state.hours || '00'}
                                                                        </div>
                                                                        <div className="countdown__item countdownminutes">
                                                                        {state.minutes || '00'}
                                                                        </div>
                                                                        <div className="countdown__item countdownseconds">
                                                                        {state.seconds || '00'}
                                                                        </div>
                                                                    </div>
                                                            </div>
                                                        </h4>
                                                    </div>
                                                </div>  
                                            </div> 
                                    </SwiperSlide>
                                ))
                            }
                                            
                        </Swiper>                     
                        <div className="sc-btn-button center mt-60">
                            <Button title='View All More' addclass='btn-2' path='/liveAuction' />
                        </div> 
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