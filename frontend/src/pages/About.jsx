import React , {useState} from 'react';
import '../scss/components/section.scss';
import Header from '.././components/header/header.jsx';
import PageTitle from '../components/page-title/page-title-v1';
import Blog from '../components/blog/blog-v1';
import dataBlog from '../assets/fake-data/data-blog';
import Brand from '../components/brand/brand-v1';
import dataBrand from '../assets/fake-data/data-brand';
import Flathelp from '../components/flat-help';
import Footer from '../components/footer/footer-v1';
import dataFooter from '../assets/fake-data/data-footer';
import Bottom from '../components/bottom';
import { Tab, Tabs, TabList, TabPanel  } from 'react-tabs';
import {Link} from 'react-router-dom';
import ReactPlayer from 'react-player/youtube'

function Popup(props) {
    return (props.trigger) ? (
        <div className="popup-video">
            <div className="overlay" onClick={() => props.setTrigger(false)}></div>
            <div className='popup-inner'>
                <div className="popup-inner-content">
                <div className="mfp-iframe-scaler">
                    <ReactPlayer url='https://www.youtube.com/watch?v=i7EMACWuErA'   
                                        playing={false}
                                        controls={false} className="popup-youtube">
                                        <span className="icon-play"></span>
                    </ReactPlayer>
                    <button className='close-btn' onClick={() => props.setTrigger(false)}><i className="far fa-times"></i></button>
                        {props.children}
                </div>
                    
                </div>
            </div>
        </div>
    ) :"";
}


function About(props) {
  
    const [buttonPopup, setButtonPopup] = useState(false);
    return (
        <div className='wrapper-style' id='wrapper'>
            {/* {<Header />} */}
            <PageTitle title='About Us'  />
            <div className="tf-section flat-about">
                <div className="container ">
                    <div className="row">
                        <div className="col-lg-6 col-md-5">
                            <div className="wrap-img">                           
                                <div className="media">
                                    <img src={require ('../assets/images/box-item/about-1.jpg')} alt="Nufti"/> 
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-7">
                            <div className="post">
                                <h4 className="sub-title fs-18 font text-color-4">About Us</h4>
                                <h2 className="title-about text-t">That's why we're on list of favorites.</h2>
                                <div className="title-text fs-18 fw-4 text-color-3">Proin massa dui, maximus vitae massa in, ullamcorper euismod justo. Ut condimentum ipsum.</div>
                                <p className="text-1">Proin massa dui, maximus vitae massa in, ullamcorper euismod justo. Ut condimentum ipsum id nibh suscipit, eget iaculis 
                                    mi mollis. Proin quis turpis odio. Suspendisse non ex a leo lobortis tincidunt condimentum quis sem. Sed ornare nunc vel mi eleifend.</p>
                                <div className="box">
                                    <div className="media">
                                        <img className="img-1" src={require ('../assets/images/box-item/about-2.jpg')} alt="Nufti"/> 
                                        <img className="img-2" src={require ('../assets/images/box-item/about-3.png')} alt="Nufti"/> 
                                    </div>
                                </div>
                            </div>                                               
                        </div>
                    </div>
                </div>
            </div>        

        </div>
    );
}

export default About;