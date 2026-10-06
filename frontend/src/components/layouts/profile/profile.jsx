import React, { useState, Fragment } from "react";
import { Link } from "react-router-dom";
import CardModal from "../../CardModal";
import { Tab, Tabs, TabList, TabPanel  } from 'react-tabs';
import Button from '../../button/button-st1';
import img1 from '../../.././assets/images/box-item/author-profile.jpg';
import icon from '../../.././assets/images/icon/icon-check.svg';
import icon2 from '../../.././assets/images/icon/icon-diamond.svg';

const Profile1 = (props) => {
  const data = props.data;
  const [modalShow, setModalShow] = useState(false);


  return (
    <Fragment>
            <div className="tf-section flat-author-profile flat-explore flat-auctions ">
                <div className="container">
                    <div className="flat-tabs tab-author">
                        <div className="author-profile flex"> 
                            <div className="feature-profile flex">
                                <div className="img-box relative">
                                    <img className="avatar" src={img1} alt="" />
                                    <img className="check" src={icon} alt="" />
                                </div>                
                                <div className="infor">
                                    <h3 className="fs-24 text-color-1">Liam Olivia Ovi</h3>
                                    <div className="box-price flat-price">                                              
                                         <div className="price flex">
                                             <img className="" src={icon2} alt="" />
                                             <div className="title-price text-color-1"> 2.39 ETH</div>
                                         </div> 
                                     </div>
                                 </div>
                            </div>
                            
                            <div className="button-profile flex">
                                <h3 className="text-color-1">12,03 Followers</h3>
                                <div className="button-follow">
                                    <Button title='Follow' addclass='sc-button btn-6 style-1 tf-style' path='#' />
                                </div>
                                <div className="button-edit">
                                    <Button title='Edit Profile' addclass='sc-button btn-5 style-2 tf-style' path='/editProfile' />
                                </div>
                            </div>
                        </div>
                        <Tabs>
                            <TabList className="menu-tab tab-title">
                                <Tab><h3>All</h3></Tab>
                                <Tab><h3>Art</h3></Tab>
                                <Tab><h3>Music</h3></Tab>
                                <Tab><h3>Collectibles</h3></Tab>
                                <Tab><h3>Sports</h3></Tab>
                            </TabList>
                            <TabPanel>
                            {
                                data.slice(4,12).map ((item,index) => (
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
                            </TabPanel>
                            <TabPanel>
                            {
                                data.slice(4,8).map ((item,index) => (
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
                            </TabPanel>
                            <TabPanel>
                            {
                                data.slice(6,12).map ((item,index) => (
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
                            </TabPanel>
                            <TabPanel>
                            {
                                data.slice(4,10).map ((item,index) => (
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
                            </TabPanel>
                            <TabPanel>
                            {
                                data.slice(8,12).map ((item,index) => (
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
                            </TabPanel>
                        </Tabs>
                        <div className="themesflat-pagination clearfix">
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


export default Profile1;
