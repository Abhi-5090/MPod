import React, { useState } from "react";
import '../scss/components/section.scss';
import Header from '.././components/header/header.jsx';
import PageTitle from '../components/page-title/page-title-v1';
import Flathelp from '../components/flat-help';
import Footer from '../components/footer/footer-v1';
import dataFooter from '../assets/fake-data/data-footer';
import Bottom from '../components/bottom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation , Grid  } from 'swiper';
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import CollectionItem from '.././components/collection/collection-item';
import dataCollection from '../assets/fake-data/data-collection';

function PopularCollections(props) {

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
        <div className='wrapper-style' id='wrapper'>
            {<Header />}
            <PageTitle title='Popular Collections' />
            <div className="tf-section flat-collection dark-style flat-auctions page">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="wrap-box explore-1 flex-one mb-27">
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

                                            {
                                                dataDropdown2.map(data=> (
                                                    <Dropdown.Item  key={data.id} to="#">{data.title}</Dropdown.Item>
                                                ))
                                            }
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
                            className='swiper-container carousel-blog show-shadow btn-collection2'
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
                                dataCollection.slice(0,12).map (item => (
                                    <SwiperSlide key={item.id}>
                                        <CollectionItem key={item.id} item={item} /> 
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

export default PopularCollections;