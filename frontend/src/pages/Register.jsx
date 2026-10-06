import React from 'react';
import '../scss/components/section.scss';
import Header from '.././components/header/header.jsx';
import PageTitle from '../components/page-title/page-title-v1';
import Flathelp from '../components/flat-help';
import Footer from '../components/footer/footer-v1';
import dataFooter from '../assets/fake-data/data-footer';
import Bottom from '../components/bottom';
import {Link} from 'react-router-dom';
function Register(props) {
    return (
        <div className='wrapper-style' id='wrapper'>
            {<Header />}
            <PageTitle title='Register'  />
            <div className="tf-section flat-login flat-auctions-details">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="wrap-login">
                                <div className="box-login post">
                                    <img src={require ('../assets/images/mark/mark-header-02.png')} alt="Nufti" className="absolute mark-page3"/>
                                    <img src={require ('../assets/images/mark/mark-login-1.png')} alt="Nufti" className="absolute mark-login1"/>
                                    <img src={require ('../assets/images/mark/mark-login-2.png')} alt="Nufti" className="absolute mark-login2 animate-rotate"/>
                                    <img src={require ('../assets/images/mark/mark-login-3.png')} alt="Nufti" className="absolute mark-login3"/>
                                    <img src={require ('../assets/images/backgroup-secsion/bg-login.png')} alt="Nufti" className="absolute mark-login"/>

                                    <div className="heading-login register">
                                        <h2 className="fw-5">Singup To NFTs</h2>
                                        <div className="flex"><p>Dont’t have an account yet? </p><Link to="/login" className="text-p text-color-3 fw-6">Login</Link></div>
                                    </div>
                                    <form action="#" id="contactform">                                
                                        <div className="form-login flat-form flex-one">
                                            <div className="info-login"> 
                                                <fieldset>
                                                    <p className="title-infor-account">User Name</p>
                                                    <input type="text" id="name" className="tb-my-input" name="name" placeholder="Enter Your Name" aria-required="true" required="" />
                                                </fieldset>  
                                                <fieldset>
                                                    <p className="title-infor-account">Gmail</p>
                                                    <input type="email" id="email" className="tb-my-input" name="email" placeholder="info@gmail.com" aria-required="true"  required="" />
                                                </fieldset>                                                                                     
                                                <fieldset className="style-pass">
                                                    <p className="title-infor-account">Password</p>
                                                    <input type="password" name="password" className="tb-my-input" id="password" placeholder="*********************************" aria-required="true"  required="" />
                                                </fieldset>   
                                                <div className="row-form style-1 flex-two">
                                                    <label className="flex align">
                                                        <input type="checkbox" />
                                                        <span className="btn-checkbox flex-two"></span>
                                                        <span className="text-p text-color-7">Remember Me</span>
                                                    </label>
                                                    <Link to="#" className="forgot-pass text-p text-color-7">Forgot Password?</Link>
                                                </div>
                                                <button className="submit button-login" >Singup</button>                                                                                                          
                                            </div>
                                            <div className="box-button">
                                                <div className="button-social">                            
                                                    <Link to="#" className="sc-button"><i className="fab fa-facebook-f"></i><span className="font">Continue With Facebook</span></Link>
                                                    <Link to="#" className="sc-button style-2"><i className="fab fa-google-plus-g"></i><span className="font">Continue With Facebook</span></Link>
                                                    <Link to="#" className="sc-button style-4"><i className="fab fa-instagram"></i><span className="font">Continue With Facebook</span></Link>
                                                </div>
                                            </div>                                   
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

export default Register;