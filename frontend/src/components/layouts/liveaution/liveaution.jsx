import React , { useEffect , useState,Fragment } from 'react';
import { Link } from "react-router-dom";
import CardModal from "../../CardModal";
import { Dropdown } from "react-bootstrap";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation , Grid  } from 'swiper';
const Liveaution = (props) => {
  const data = props.data;
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
    <Fragment>
            <div className="tf-section dark-style flat-auctions live-auctions">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="wrap-box explore-1 flex-one mb-30">
                                <div className="seclect-box style-1 flex text-t font">
                                    <div id="item_category" className="dropdown">
                                    <Dropdown>
                                        <Dropdown.Toggle id="dropdown-basic">
                                            All categories
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu style={{ margin: 0 }}>
                                            <Dropdown.Item to="#">Art</Dropdown.Item>
                                            <Dropdown.Item to="#">Music</Dropdown.Item>
                                            <Dropdown.Item to="#">Domain Names</Dropdown.Item>
                                            <Dropdown.Item to="#">Virtual World</Dropdown.Item>
                                            <Dropdown.Item to="#">Trading Cards</Dropdown.Item>
                                            <Dropdown.Item to="#">Sports</Dropdown.Item>
                                            <Dropdown.Item to="#">Utility</Dropdown.Item>
                                        </Dropdown.Menu>
                                     </Dropdown>
                                    </div>
                                    <div id="view" className="dropdown">
                                        <Dropdown>
                                            <Dropdown.Toggle id="dropdown-basic">
                                            Short View
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu style={{ margin: 0 }}>
                                                <Dropdown.Item to="#">On Auction</Dropdown.Item>
                                                <Dropdown.Item to="#">Has Offers</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                    <div id="new-items" className="dropdown">
                                        <Dropdown>
                                            <Dropdown.Toggle id="dropdown-basic">
                                            New Items
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu style={{ margin: 0 }}>
                                                <Dropdown.Item to="#">Single Items</Dropdown.Item>
                                                <Dropdown.Item to="#">Bundles</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>
                                <div className="seclect-box style-2 box-right flex">
                                    <div className="title-item btn-selector nolink fw-6 font fs-16"><span className="text-color-3">95</span> Explore Work Found</div>
                                    <div className="widget search">
                                        <form action="#" method="get" role="search" className="search-form">
                                            <input type="search" className="search-field"
                                                placeholder="Project Name..." name="s"
                                                title="Search for" required="" />
                                            <button className="search-icon search-submit" type="submit" title="Search"></button>
                                        </form>
                                    </div> 
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-12 col-md-12">
                        <Swiper
                            className='swiper-container carousel-6 show-shadow btn-collection2'
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
                                    slidesPerView: 4,
                                    spaceBetween: 30,
                                },
                            }}
                            >
                            {
                                data.slice(0,12).map (item => (
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
      <CardModal show={modalShow} onHide={() => setModalShow(false)} />
    </Fragment>
  );
};


export default Liveaution;
