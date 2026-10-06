import React from 'react';
import '../scss/components/section.scss';
import { Link } from "react-router-dom";
import Header from '.././components/header/header.jsx';
import PageTitle from '../components/page-title/page-title-v1';
import Flathelp from '../components/flat-help';
import Footer from '../components/footer/footer-v1';
import dataFooter from '../assets/fake-data/data-footer';
import Bottom from '../components/bottom';

import img1 from '.././assets/images/box-item/edit-profile.jpg';
import img2 from '.././assets/images/box-item/edit-profile-2.jpg';
import icon from '.././assets/images/icon/icon-check.svg';

function EditProfile(props) {
    return (
        <div className='wrapper-style' id='wrapper'>
            <div className="tf-section flat-explore flat-edit-profile flat-auctions-details ">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-3 col-lg-4">
                            <div className="author-profile"> 
                                <div className="feature-profile center">
                                    <div className="wrap-img flex j-content">
                                        <div className="img-box relative">                                
                                            <img className="avatar" id="profileimg" src={img1} alt="" />
                                            <img className="check absolute" src={icon} alt="" />                                      
                                        </div> 
                                    </div>
                                                               
                                    <div id="upload-profile">
                                        <Link to="/editProfile" className="btn-upload">
                                            Upload Your Photo </Link>
                                            <input id="tf-upload-img" name="profile" required="" type="file" />
                                        <Link to="#" className="btn-upload btn-delete" id="tf-remove-img">
                                            Delete </Link>
                                    </div>                     
                                </div>                   
                            </div> 
                        </div>  
                        <div className="col-xl-9 col-lg-8">
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
                                            <img className="avatar" id="editimg" src={img2} alt="" />   
                                        </div>                                                                                                                                       
                                    </div>
                                </div> 
                                
                                <h3 className="title-two fw-6">Update Your Information</h3> 
                                <form action="#" className="form-profile">                     
                                    <div className="form-infor-profile">
                                        <div className="form-infor flex flat-form">
                                            <div className="info-account">                              
                                                <fieldset>
                                                    <p className="title-infor-account">User Name</p>
                                                    <input type="text" placeholder="Enter Your Name" required />
                                                </fieldset>
                                                <fieldset>
                                                    <p className="title-infor-account">Gmail</p>
                                                    <input type="email" placeholder="info@gmail.com" required />
                                                </fieldset>
                                                <fieldset>
                                                    <p className="title-infor-account">Custom URL</p>
                                                    <input type="url" placeholder="infomela.com" required />
                                                </fieldset>                                                                           
                                            </div>
                                            <div className="info-social">                                 
                                                <fieldset>
                                                    <p className="title-infor-account">Phone</p>
                                                    <input type="number" placeholder="+55 12333 444 55" name="phone" required />                                             
                                                </fieldset>
                                                <fieldset>
                                                    <p className="title-infor-account">Address</p>
                                                    <input type="text" placeholder="Your Address Create" required />
                                            
                                                </fieldset>
                                                <fieldset>
                                                    <p className="title-infor-account">Password</p>
                                                    <input type="password" placeholder="****************" required />                                              
                                                </fieldset>
                                            </div>  
                                        </div> 
                                        <fieldset className="message">
                                            <p className="title-infor-account">Bio</p>
                                            <textarea tabIndex="4" rows="3" required></textarea>
                                        </fieldset>                                                              
                                    </div>
                                
                                    <h3 className="title-three fw-6">Your Social Media</h3>
                                    <p className="text-social text-t">Proin massa dui, maximus vitae massa in, ullamcorper euismod justo.</p>
                                    <div className="box-button">
                                        <div className="button-social">                            
                                            <Link to="#" className="sc-button"><i className="fab fa-facebook-f"></i><span className="font">Connect To Facebook</span></Link>
                                            <Link to="#" className="sc-button style-2"><i className="fab fa-google-plus-g"></i><span className="font">Connect To Google</span></Link>
                                            <Link to="#" className="sc-button style-3"><i className="fab fa-twitter"></i><span className="font">Connect To Twitter</span></Link>
                                            <Link to="#" className="sc-button style-4"><i className="fab fa-instagram"></i><span className="font">Connect To Instagram</span></Link>
                                            <Link to="#" className="sc-button style-5"><i className="fab fa-skype"></i><span className="font">Connect To Skype</span></Link>
                                        </div>
                                    </div>
                                    <button className="tf-button-submit mg-t-15" type="submit">
                                        Save & Update Information
                                    </button>           
                                </form>              
                            </div> 
                        </div>     
                    </div>           
                </div>
            </div>
        </div>
    );
}

export default EditProfile;