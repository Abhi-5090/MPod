import React , { useEffect , useState,Fragment } from 'react';
import '../scss/components/section.scss';
import {Link} from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel  } from 'react-tabs';
import Header from '.././components/header/header.jsx';
import PageTitle from '../components/page-title/page-title-v1';
import Flathelp from '../components/flat-help';
import Footer from '../components/footer/footer-v1';
import dataFooter from '../assets/fake-data/data-footer';
import Bottom from '../components/bottom';
import Liveaution from '../components/liveauctions/liveauction-v3';
import dataLiveaution2 from '../assets/fake-data/data-liveaution';

import CardModal from '../components/CardModal';

import img1 from '../assets/images/avatar/avt-01.png'
import img2 from '../assets/images/avatar/avt-04.jpg'
import img3 from '../assets/images/avatar/avt-05.jpg'

function LiveAuctionDetails(props) {
    const [dataLiveaution] = useState(
        [
            {
                img: img1,
                author:"Themesflat",
                price1: "2.39 ETH",
                price2: "=€ 10.23",
            },
            {
                img: img2,
                author:"Themesflat",
                price1: "2.39 ETH",
                price2: "=€ 10.23",
            },
            {
                img: img3,
                author:"Themesflat",
                price1: "2.39 ETH",
                price2: "=€ 10.23",
            },
        ]
    )
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


    return (
        <div className='wrapper-style' id='wrapper'>
            {<Header />}
            <PageTitle title='Live Auctions Details'  />
            <Fragment>
                <div className="tf-section flat-auctions-details">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6 col-md-12">
                                <div className="wrap-img">
                                    <div className="img-detail">
                                        <div className="media">
                                            <img src={require ('../assets/images/box-item/auctions-details-1.jpg')} alt="Nufti"/>
                                        </div>
                                        <h6 className="tags text-t">6 in stock</h6>  
                                    </div>
                                    <div className="img-detail">
                                        <div className="media">
                                            <img src={require ('../assets/images/box-item/auctions-details-2.jpg')} alt="Nufti"/> 
                                        </div>
                                    </div>
                                    <div className="img-detail">
                                        <div className="media">
                                            <img src={require ('../assets/images/box-item/auctions-details-3.jpg')} alt="Nufti"/> 
                                        </div>
                                    </div>  
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="post mtop-7">
                                    <h2 className="fw-5 mt-2">Axtronic Electronics VS-10</h2>
                                    <div className="meta-info mb-17">
                                        <div className="author">
                                            <div className="avatar">
                                                <img src={require ('../assets/images/avatar/avt-01.png')} alt="Nufti"/> 
                                                <div className="check">
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <g clipPath="url(#clip0_75_103)">
                                                    <circle cx="6.5" cy="5.5" r="3.5" fill="#3AFCC2"/>
                                                    <path d="M9.972 1.32089L6 0.00439453L2.028 1.32089C1.72874 1.4201 1.46834 1.61108 1.2838 1.86671C1.09926 2.12234 0.999959 2.42961 1 2.74489V5.99988C1 9.76188 5.6 11.8394 5.797 11.9259L5.974 12.0044L6.158 11.9434C6.356 11.8774 11 10.2884 11 5.99988V2.74489C11 2.42961 10.9007 2.12234 10.7162 1.86671C10.5317 1.61108 10.2713 1.4201 9.972 1.32089ZM6.222 6.99438C6.13459 7.08237 6.03058 7.15213 5.91599 7.19959C5.8014 7.24706 5.67853 7.27129 5.5545 7.27088H5.538C5.41145 7.26894 5.2866 7.24136 5.17101 7.18979C5.05542 7.13823 4.95149 7.06376 4.8655 6.97088L3.7125 5.77088L4.434 5.07989L5.556 6.24988L8.1465 3.65939L8.8535 4.36639L6.222 6.99438Z" fill="#7759F3"/>
                                                    </g>
                                                    <defs>
                                                    <clipPath id="clip0_75_103">
                                                    <rect width="12" height="12" fill="white"/>
                                                    </clipPath>
                                                    </defs>
                                                </svg>
                                                </div>
                                            </div>
                                            <div className="info">
                                                <h5> By<a className="text-color-3" href="author-profile.html"> Themesflat</a> </h5>
                                                <div className="date"> In <span className="text-color-6"> @ 3d Models</span></div>                                           
                                            </div>
                                        </div>                                  
                                    </div>  
                                    <div className="box-price flat-price flex">                                              
                                        <div className="price flex">
                                            <div className='icon-price'>
                                                <svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M5.97861 0L0.0426636 9.73665L5.97861 7.13167L12 9.73665L5.97861 0Z" fill="#7759F3"/>
                                                    <path d="M5.97865 7.04639L0 9.73678L5.97865 13.1531L12 9.73678L5.97865 7.04639Z" fill="url(#paint0_linear_75_92)"/>
                                                    <path d="M5.97872 19.0889L0.0854797 10.8896L5.97872 14.306L11.9147 10.8896L5.97872 19.0889Z" fill="#7759F3"/>
                                                    <defs>
                                                    <linearGradient id="paint0_linear_75_92" x1="6" y1="7.04639" x2="6" y2="13.1531" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#4D30CA"/>
                                                    <stop offset="1" stopColor="#7759F3"/>
                                                    </linearGradient>
                                                    </defs>
                                                </svg>
                                            </div>
                                            <div className="title-price"> 2.39 ETH</div>
                                        </div> 
                                        <div className="flex">
                                            <p>[05 Reviews]</p> 
                                            <div className="star">
                                                <i className="fas fa-star"></i> 
                                                <i className="fas fa-star"></i> 
                                                <i className="fas fa-star"></i> 
                                                <i className="fas fa-star"></i> 
                                                <i className="fas fa-star"></i> 
                                            </div>      
                                        </div>                                                  
                                    </div>
                                    <p className="texts">Proin massa dui, maximus vitae massa in, ullamcorper euismod justo. Ut condimentum ipsum id nibh suscipit, eget iaculis mi mollis. 
                                        Proin quis turpis odio. Suspendisse non ex a leo lobortis tincidunt condimentum quis sem. Sed ornare nunc vel mi eleifend, a posuere 
                                        mauris efficitur. Duis sed velit est.</p>
                                    <div className="information flex">
                                        <div className="column column-1">
                                            <h4 className="title-1 fw-5 text-color-3">Artist: <span className="">Jons Bond</span></h4>
                                            <h4 className="fw-5 text-color-3">Size: <span className="">390x390</span></h4>
                                        </div>
                                        <div className="column column-2">
                                            <h4 className="title-1 fw-5 text-color-3">Create: <span className="">03/ 12/ 2022</span></h4>
                                            <h4 className="fw-5 text-color-3">Collection: <span className="">Art Design</span></h4>                                  
                                        </div>                                    
                                    </div>
                                    <div className="featured-countdown">
                                        <div className="flex">
                                        <h3><span className="title-countdown">Ending Time - </span>
                                        </h3>
                                        <div className="js-countdown">
                                            <div className="countdown__timer">
                                                <h3 className="countdown__item">
                                                    {state.days || '0'}
                                                </h3>
                                                <h3 className="countdown__item countdownhours">
                                                {state.hours || '00'}
                                                </h3>
                                                <h3 className="countdown__item countdownminutes">
                                                {state.minutes || '00'}
                                                </h3>
                                                <h3 className="countdown__item countdownseconds">
                                                {state.seconds || '00'}
                                                </h3>
                                            </div>
                                        </div> 
                                        </div>
                                    </div>
                                    <div className="button-place-bid">
                                        <Link to="#" data-toggle="modal" data-target="#popup_bid" className="sc-button btn-3" onClick={() => setModalShow(true)}><span>Place Bid</span></Link>
                                    </div>
                                    <Tabs>
                                        <TabList className="menu-tab tab-title">
                                            <Tab><h3>Bid History</h3></Tab>
                                            <Tab><h3>Info</h3></Tab>
                                            <Tab><h3>Details</h3></Tab>
                                        </TabList>
                                        <TabPanel>
                                            <div className="content-tab">
                                            <ul className="bid-history-list list-1">
                                                {
                                                    dataLiveaution.map((item,index) => (
                                                    <li key={index}>
                                                        <div className="content">
                                                            <div className="meta-info flex-one style">
                                                                <div className="author">
                                                                    <div className="avatar">
                                                                        <img src={item.img} alt="Nufti"/> 
                                                                        <div className='check'>
                                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <g clipPath="url(#clip0_75_103)">
                                                                                <circle cx="6.5" cy="5.5" r="3.5" fill="#3AFCC2"/>
                                                                                <path d="M9.972 1.32089L6 0.00439453L2.028 1.32089C1.72874 1.4201 1.46834 1.61108 1.2838 1.86671C1.09926 2.12234 0.999959 2.42961 1 2.74489V5.99988C1 9.76188 5.6 11.8394 5.797 11.9259L5.974 12.0044L6.158 11.9434C6.356 11.8774 11 10.2884 11 5.99988V2.74489C11 2.42961 10.9007 2.12234 10.7162 1.86671C10.5317 1.61108 10.2713 1.4201 9.972 1.32089ZM6.222 6.99438C6.13459 7.08237 6.03058 7.15213 5.91599 7.19959C5.8014 7.24706 5.67853 7.27129 5.5545 7.27088H5.538C5.41145 7.26894 5.2866 7.24136 5.17101 7.18979C5.05542 7.13823 4.95149 7.06376 4.8655 6.97088L3.7125 5.77088L4.434 5.07989L5.556 6.24988L8.1465 3.65939L8.8535 4.36639L6.222 6.99438Z" fill="#7759F3"/>
                                                                                </g>
                                                                                <defs>
                                                                                <clipPath id="clip0_75_103">
                                                                                <rect width="12" height="12" fill="white"/>
                                                                                </clipPath>
                                                                                </defs>
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                    <div className="info">
                                                                        <h5> By<Link className="text-color-3" to="/author">{item.author}</Link> </h5>
                                                                        <div className="date"> Place A Bid <span className="text-color-6"> @ 3d Models</span></div>                                           
                                                                    </div>
                                                                </div> 
                                                                <div className="flat-price">                                              
                                                                    <div className="price flex">
                                                                        <div className='icon-price'>
                                                                            <svg width="17" height="28" viewBox="0 0 17 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <path d="M8.47102 0L0.0625 13.7924L8.47102 10.1023L17.0005 13.7924L8.47102 0Z" fill="#7759F3"/>
                                                                                <path d="M8.46901 9.98132L0 13.7924L8.46901 18.6318L16.9985 13.7924L8.46901 9.98132Z" fill="url(#paint0_linear_136_19)"/>
                                                                                <path d="M8.47302 27.0403L0.125 15.4257L8.47302 20.2651L16.8815 15.4257L8.47302 27.0403Z" fill="#7759F3"/>
                                                                                <defs>
                                                                                <linearGradient id="paint0_linear_136_19" x1="8.49926" y1="9.98132" x2="8.49926" y2="18.6318" gradientUnits="userSpaceOnUse">
                                                                                <stop stopColor="#4D30CA"/>
                                                                                <stop offset="1" stopColor="#7759F3"/>
                                                                                </linearGradient>
                                                                                </defs>
                                                                            </svg>
                                                                        </div>
                                                                        <div className="title-price">{item.price1}  <p className="font-2">{item.price2}</p> </div>                                                                   
                                                                    </div>                                                                                        
                                                                </div>                                 
                                                            </div>                                                     
                                                        </div>
                                                    </li>
                                                    ))
                                                }
                                                </ul>
                                            </div>
                                        </TabPanel>
                                         <TabPanel>
                                            <div className="content-tab">
                                                 <ul className="bid-history-list list-2">
                                                    <li>
                                                        <div className="content">
                                                            <div className="meta-info flex-one style">
                                                                <div className="author">
                                                                    <div className="avatar">
                                                                        <img src={require ('../assets/images/avatar/avt-05.jpg')} alt="Nufti"/> 
                                                                        <div className='check'>
                                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <g clipPath="url(#clip0_75_103)">
                                                                                <circle cx="6.5" cy="5.5" r="3.5" fill="#3AFCC2"/>
                                                                                <path d="M9.972 1.32089L6 0.00439453L2.028 1.32089C1.72874 1.4201 1.46834 1.61108 1.2838 1.86671C1.09926 2.12234 0.999959 2.42961 1 2.74489V5.99988C1 9.76188 5.6 11.8394 5.797 11.9259L5.974 12.0044L6.158 11.9434C6.356 11.8774 11 10.2884 11 5.99988V2.74489C11 2.42961 10.9007 2.12234 10.7162 1.86671C10.5317 1.61108 10.2713 1.4201 9.972 1.32089ZM6.222 6.99438C6.13459 7.08237 6.03058 7.15213 5.91599 7.19959C5.8014 7.24706 5.67853 7.27129 5.5545 7.27088H5.538C5.41145 7.26894 5.2866 7.24136 5.17101 7.18979C5.05542 7.13823 4.95149 7.06376 4.8655 6.97088L3.7125 5.77088L4.434 5.07989L5.556 6.24988L8.1465 3.65939L8.8535 4.36639L6.222 6.99438Z" fill="#7759F3"/>
                                                                                </g>
                                                                                <defs>
                                                                                <clipPath id="clip0_75_103">
                                                                                <rect width="12" height="12" fill="white"/>
                                                                                </clipPath>
                                                                                </defs>
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                    <div className="info">
                                                                        <h5> By<Link className="text-color-3" to="/author"> Themesflat</Link> </h5>
                                                                        <div className="date"> Place A Bid <span className="text-color-6"> @ 3d Models</span></div>                                           
                                                                    </div>
                                                                </div>                                                                                        
                                                            </div>                                                     
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                         </TabPanel>
                                         <TabPanel>
                                            <div className="content-tab">
                                                <div className="provenance">
                                                    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
                                                        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
                                                        when an unknown printer took a galley of type and scrambled it to make a type specimen book. 
                                                        It has survived not only five centuries, but also the leap into electronic typesetting, 
                                                        remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, 
                                                        and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
                                                </div>
                                            </div>
                                        </TabPanel>
                                    </Tabs>
                                    <div className="button-social">                            
                                        <Link to="#" className="sc-button"><i className="fab fa-facebook-f"></i><span className="font">Facebook</span></Link>
                                        <Link to="#" className="sc-button style-2"><i className="fab fa-google-plus-g"></i><span className="font">Google</span></Link>
                                        <Link to="#" className="sc-button style-3"><i className="fab fa-twitter"></i><span className="font">Twitter</span></Link>
                                        <Link to="#" className="sc-button style-4"><i className="fab fa-instagram"></i><span className="font">Instagram</span></Link>
                                    </div>
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
            {<Liveaution classection='tf-section flat-auctions live-auctions style2 nft-style' data={dataLiveaution2}/>}
            {<Flathelp />}
            {<Footer data={dataFooter}/>}
            {<Bottom classection='widget-social-footer'/>}
        </div>
    );
}

export default LiveAuctionDetails;