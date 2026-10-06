import React, { useState, Fragment } from "react";
import { Link } from "react-router-dom";
import CardModal from "../../CardModal";
import { Dropdown } from "react-bootstrap";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation , Grid  } from 'swiper';
const Explore1 = (props) => {
  const data = props.data;
  const [modalShow, setModalShow] = useState(false);

  const [dataDropdown] = useState(
    [
        {
            id: 1,
            title: "Art",
        },
        {
            id: 2,
            title: "Music",
        },
        {
            id: 3,
            title: "Domain Names",
        },
        {
            id: 4,
            title: "Virtual World",
        },
        {
            id: 5,
            title: "Trading Cards",
        },
        {
            id: 6,
            title: "Sports",
        },
        {
            id: 7,
            title: "Utility",
        },
    ]
)
    const [dataDropdown2] = useState(
    [
        {
            id: 1,
            title: "On Auction",
        },
        {
            id: 2,
            title: "Has Offers",
        },
    ]
)
const [dataDropdown3] = useState(
    [
        {
            id: 1,
            title: "Single Items",
        },
        {
            id: 2,
            title: "Bundles",
        },
    ]
)
  return (
    <Fragment>
            <div className="tf-section flat-explore flat-auctions dark-style ">
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
                                            {
                                                dataDropdown.map(data=> (
                                                    <Dropdown.Item  key={data.id} to="#">{data.title}</Dropdown.Item>
                                                ))
                                            }
                                        </Dropdown.Menu>
                                     </Dropdown>
                                    </div>
                                    <div id="view" className="dropdown">
                                        <Dropdown>
                                            <Dropdown.Toggle id="dropdown-basic">
                                            Short View
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu style={{ margin: 0 }}>
                                            {
                                                dataDropdown2.map(data=> (
                                                    <Dropdown.Item  key={data.id} to="#">{data.title}</Dropdown.Item>
                                                ))
                                            }
                                        </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                    <div id="new-items" className="dropdown">
                                        <Dropdown>
                                            <Dropdown.Toggle id="dropdown-basic">
                                            New Items
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu style={{ margin: 0 }}>
                                            {
                                                dataDropdown3.map(data=> (
                                                    <Dropdown.Item  key={data.id} to="#">{data.title}</Dropdown.Item>
                                                ))
                                            }
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
                                data.slice(4,16).map (item => (
                                    <SwiperSlide key={item.id}>
                                        <div className="sc-card-product sc-card-article blog-article style">
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


export default Explore1;
