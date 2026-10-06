import React, { useState, Fragment } from "react";
import '../scss/components/section.scss';
import Header from '.././components/header/header.jsx';
import PageTitle from '../components/page-title/page-title-v1';
import Flathelp from '../components/flat-help';
import Footer from '../components/footer/footer-v1';
import dataFooter from '../assets/fake-data/data-footer';
import Bottom from '../components/bottom';
import dataProduct from '../assets/fake-data/data-liveaution';
import {Link} from 'react-router-dom';
import img1 from '../assets/images/box-item/edit-profile-2.jpg';
import CardModal from ".././components/CardModal";
import { Dropdown } from "react-bootstrap";
import { Tab, Tabs, TabList, TabPanel  } from 'react-tabs';

function CreateItem(props) {
    const [modalShow, setModalShow] = useState(false);
    const [dataDropdown] = useState(
        [
            {
                id: 1,
                title: "€10",
            },
            {
                id: 2,
                title: "€20",
            },
            {
                id: 3,
                title: "€50",
            },
            {
                id: 4,
                title: "€100",
            },
            {
                id: 5,
                title: "€150",
            },
            {
                id: 6,
                title: "€200",
            },
            {
                id: 7,
                title: "€500",
            },
        ]
    )
    const [dataDropdown2] = useState(
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
    return (
        <div className='wrapper-style' id='wrapper'>
            {<Header />}
            <PageTitle title='Create Item' />
            <Fragment>
            <div className="tf-section flat-create-item flat-edit-profile flat-auctions-details flat-explore flat-auctions">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-3 col-lg-4 col-md-6 ">
                        {
                                dataProduct.slice(4,5).map ((item,index) => (
                                    <div className="sc-card-product sc-card-article blog-article" key={item.id}>
                                        <div className="card-media flat-img">
                                            <Link to="live-auctions-details.html">
                                                <img src={item.img} alt="img" />
                                            </Link>                                                                                                                                                                                                     
                                        </div>  
                                        <div className="content">
                                            <h6 className="tags">{item.tags}</h6>  
                                            <h3><Link to="live-auctions-details.html">{item.title}</Link></h3> 
                                            <div className="meta-info mb-17">
                                                <div className="author">
                                                    <div className="avatar">
                                                        <img src={item.imgauthor} alt="" />
                                                        <img className='check' src={item.icon1} alt="Nufti"/>
                                                    </div>
                                                    <div className="info">
                                                        <h5> By<a className="text-color-3" href="author-profile.html">{item.author}</a> </h5>
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
                                ))
                            }
                        </div>  
                        <div className="col-xl-9 col-lg-8 col-md-12">
                            <div className="form-upload-profile post"> 
                                <h3 className="title-one fw-6">Choice Your Cover Image</h3> 
                                <div className="option-profile flex">                                 
                                    <form action="#">
                                        <label className="uploadFile">                                       
                                            <input type="file" className="inputfile form-control" id="upload-img2" name="file" />
                                        </label>
                                    </form> 
                                    <div className="img-box"> 
                                        <div className="media">
                                            <img className="avatar" id="editimg" src={img1} alt="" />   
                                        </div>                                                                                                                                       
                                    </div>
                                </div> 
                                
                                <h3 className="title-two fw-6">Select Method</h3> 
                                <form action="#" className="form-profile">                     
                                    <div className="form-infor-profile flat-form">
                                        <div className="form-infor flex">
                                            <div className="info-title info-account">                              
                                                <fieldset>
                                                    <p className="title-infor-account">Title</p>
                                                    <input type="text" placeholder="Enter your Product Name" required />
                                                </fieldset>                                                                                                                   
                                            </div>
                                            <div className="info-stock info-social">                                 
                                                <fieldset>
                                                    <p className="title-infor-account">Stock</p>
                                                    <div className="number-wrapper"><input type="number" placeholder="6 In Stock"  min="0" max="9" step="1" required />    </div>                                         
                                                </fieldset>
                                            </div>  
                                        </div> 
                                        <fieldset className="message">
                                            <p className="title-infor-account">Description</p>
                                            <textarea tabIndex="4" rows="3" required></textarea>
                                        </fieldset>                                                              
                                    </div>

                                    <h3 className="title-three fw-6">Select Method</h3>
                                    <p className="text-tag">Price Tag</p>
                                    <div className="flat-tabs tab-create-item flat-form">
                                        <Tabs>
                                            <TabList className="menu-tab tab-title flex-two">
                                                <Tab>
                                                    <i className="far fa-tag"></i>
                                                    <span className="inner fw-6 font">Fixed Price</span>
                                                </Tab>
                                                <Tab>
                                                    <i className="far fa-clock"></i>
                                                    <span className="inner fw-6 font">Time Auction</span>
                                                </Tab>
                                                <Tab>
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

                                                <span className="inner fw-6 font">Open For Bids</span>
                                                </Tab>
                                            </TabList>
                                            <TabPanel>
                                                <div className="form-tab flex-one">
                                                    <div id="item-create1" className="dropdown info-title">
                                                        <p className="title-infor-account">Price</p>
                                                        <Dropdown>
                                                            <Dropdown.Toggle id="dropdown-basic">
                                                            €50
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
                                                    <div className="info-title info-account">                              
                                                        <fieldset>
                                                            <p className="title-infor-account">Size</p>
                                                            <input type="text" placeholder="150 KB" required />
                                                        </fieldset>                                                                                                                   
                                                    </div>
                                                    <div id="item-create2" className="dropdown info-title">
                                                        <p className="title-infor-account">Category</p>
                                                        <Dropdown>
                                                            <Dropdown.Toggle id="dropdown-basic">
                                                            Creative
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
                                                </div>
                                                <div className="info-title info-account info-royalties">                              
                                                    <fieldset>
                                                        <p className="title-infor-account">Royalties</p>
                                                        <input type="text" placeholder="15%" required />
                                                    </fieldset>                                                                                                                   
                                                </div>  
                                            </TabPanel>
                                            <TabPanel>
                                                <div className="info-title info-account info-royalties">                              
                                                    <fieldset>
                                                        <p className="title-infor-account">Minimum bid</p>
                                                        <input type="text" placeholder="Enter Minimum Bid" required />
                                                    </fieldset>                                                                                                                   
                                                </div>
                                                <div className="form-infor-profile form-style">
                                                    <div className="form-infor flex">
                                                        <div className="info-title info-account">                              
                                                            <fieldset className="style">
                                                                <p className="title-infor-account">Starting Date</p>
                                                                <input type="date" name="bid_starting_date"  className="form-control" min="1997-01-01" />
                                                            </fieldset>                                                                                                                   
                                                        </div>
                                                        <div className="info-stock info-social">                                 
                                                            <fieldset className="style">
                                                                <p className="title-infor-account">Expiration Date</p>
                                                                <input type="date" name="bid_expiration_date"  className="form-control" />
                                                            </fieldset>
                                                        </div>  
                                                    </div> 
                                                </div>
                                            </TabPanel>
                                            <TabPanel>
                                            <div className="form-tab flex-one">
                                                    <div id="item-create1" className="dropdown info-title">
                                                        <p className="title-infor-account">Price</p>
                                                        <Dropdown>
                                                            <Dropdown.Toggle id="dropdown-basic">
                                                            €50
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
                                                    <div className="info-title info-account">                              
                                                        <fieldset>
                                                            <p className="title-infor-account">Size</p>
                                                            <input type="text" placeholder="150 KB" required />
                                                        </fieldset>                                                                                                                   
                                                    </div>
                                                    <div id="item-create2" className="dropdown info-title">
                                                        <p className="title-infor-account">Category</p>
                                                        <Dropdown>
                                                            <Dropdown.Toggle id="dropdown-basic">
                                                            Creative
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
                                                </div>
                                                <div className="form-infor-profile">
                                                    <div className="form-infor flex">
                                                        <div className="info-title info-account">                              
                                                            <fieldset className="style">
                                                                <p className="title-infor-account">Starting Date</p>
                                                                <input type="date" name="bid_starting_date" id="bid_starting_date" className="form-control" min="1997-01-01" />
                                                            </fieldset>                                                                                                                   
                                                        </div>
                                                        <div className="info-stock info-social">                                 
                                                            <fieldset className="style">
                                                                <p className="title-infor-account">Expiration Date</p>
                                                                <input type="date" name="bid_expiration_date" id="bid_expiration_date" className="form-control" />
                                                            </fieldset>
                                                        </div>  
                                                    </div> 
                                                </div>
                                            </TabPanel>  
                                        </ Tabs>
                                    </div>
                                
                                    <h3 className="title-three fw-6">Share Social Media</h3>
                                    <p className="text-social text-t">Proin massa dui, maximus vitae massa in, ullamcorper euismod justo.</p>
                                    <div className="button-social">                            
                                        <Link to="#" className="sc-button"><i className="fab fa-facebook-f"></i><span className="font">Facebook</span></Link>
                                        <Link to="#" className="sc-button style-2"><i className="fab fa-google-plus-g"></i><span className="font">Google</span></Link>
                                        <Link to="#" className="sc-button style-3"><i className="fab fa-twitter"></i><span className="font">Twitter</span></Link>
                                        <Link to="#" className="sc-button style-4"><i className="fab fa-instagram"></i><span className="font">Instagram</span></Link>
                                    </div>
                                        
                                </form>              
                            </div> 
                        </div>     
                    </div>           
                </div>
            </div>
            </Fragment>
            <CardModal show={modalShow} onHide={() => setModalShow(false)} />
            {<Flathelp />}
            {<Footer data={dataFooter}/>}
            {<Bottom classNameection='widget-social-footer'/>}
        </div>
    );
}

export default CreateItem;