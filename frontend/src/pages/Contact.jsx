import React , {useState} from 'react';
import '../scss/components/section.scss';
import Header from '.././components/header/header.jsx';
import PageTitle from '../components/page-title/page-title-v1';
import Flathelp from '../components/flat-help';
import Footer from '../components/footer/footer-v1';
import dataFooter from '../assets/fake-data/data-footer';
import Bottom from '../components/bottom';
import { Link } from "react-router-dom";
import img1 from '../assets/images/icon/icon1.svg';
import img2 from '../assets/images/icon/icon2.svg';
import img3 from '../assets/images/icon/icon3.svg';

function Contact(props) {

    const [dataContact] = useState(
        [
            {
                img: img1,
                text: 'Contact Phone',
                adress: '+55 (9900) 666',
            },
            {
                img: img2,
                text: 'Contact Mail',
                adress: 'info.nft@gmail.com',
            },
            {
                img: img3,
                text: 'Contact Location',
                adress: '18/2 Pollobi, Australia.',
            }
        ]
    )

    return (
        <div className='wrapper-style' id='wrapper'>
            {<Header />}
            <PageTitle title='Contact'  />
            <section className="tf-section tf-map">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="map">
                                <iframe title='map' className="map-content" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4457.30210514409!2d144.9550716623184!3d-37.818421643591336!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d4dd5a05d97%3A0x3e64f855a564844d!2s121%20King%20St%2C%20Melbourne%20VIC%203000%2C%20%C3%9Ac!5e0!3m2!1svi!2s!4v1631871760998!5m2!1svi!2s" width="1720" height="655" allowFullScreen="" loading="lazy" />
                            </div>
                            <div className="box-adderss">
                                <div className="inner-box flex-one">
                                    {
                                        dataContact.map((item,index) => (
                                            <div className="post flex" key={index}>
                                                <div className="icon icon-phone">
                                                    <img src={item.img} alt="" />
                                                </div>
                                                <div className="content">
                                                    <p className="text-color-1">{item.text}</p>
                                                    <Link className="fw-4 fs-20" to="tel:+123456789">{item.adress}</Link>
                                                </div> 
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <div className=" flat-contact flat-edit-profile">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="wrap-contact">
                                <div className="heading center">
                                    <h2 className="fw-6">Contact Us</h2>
                                    <p>Nunc velit metus, volutpat elementum euismod eget, cursus nec nunc.</p>
                                </div>
                                <div className="form-upload-profile post"> 
                                    <form action="#" className="form-profile">                     
                                        <div className="form-infor-profile">
                                            <div className="form-infor flex flat-form">
                                                <div className="info-account">                              
                                                    <fieldset>                                               
                                                        <input type="text" placeholder="Your Full Name" required />
                                                    </fieldset>
                                                    <fieldset>                                            
                                                        <input type="number" placeholder="+55 (121) 234 444" required />                                             
                                                    </fieldset>                                                                                                       
                                                </div>
                                                <div className="info-social">
                                                    <fieldset>                                                
                                                        <input type="email" placeholder="info.lawlead@gmail.com" required />
                                                    </fieldset>                                  
                                                    
                                                    <fieldset>                                                   
                                                        <input type="text" placeholder="Enter Your Address" required />                                          
                                                    </fieldset>                                       
                                                </div>  
                                            </div> 
                                            <fieldset className="message">                           
                                                <textarea placeholder="Additional Message" tabIndex="4" rows="3" required></textarea>                           
                                            </fieldset>                                                              
                                        </div>
                                        <div className="button-contact center">
                                            <button className="submit" type="submit">
                                                Submit Now
                                            </button>     
                                        </div>                                      
                                    </form>              
                                </div> 
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

export default Contact;