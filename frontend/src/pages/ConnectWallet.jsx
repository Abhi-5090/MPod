import React from 'react';
import '../scss/components/section.scss';
import Header from '.././components/header/header.jsx';
import PageTitle from '../components/page-title/page-title-v1';
import Flathelp from '../components/flat-help';
import Footer from '../components/footer/footer-v1';
import dataFooter from '../assets/fake-data/data-footer';
import Bottom from '../components/bottom';
import datawaller from '../assets/fake-data/data-ConnectWallet';
import { Link } from "react-router-dom";

function ConnectWallet(props) {
    return (
        <div className='wrapper-style' id='wrapper'>
            {<Header />}
            <PageTitle title='Connect Wallet'  />
            <div className="tf-section flat-connect-wallet">
                <div className="container">
                    <div className="row">
                        {
                            datawaller.map(item =>(
                                <div className="col-xl-3 col-lg-4 col-md-6" key={item.id}>
                                    <div className="wrap-connect center">          
                                        <div className={`popular absolute ${item.classAction}`}><h3 className="fw-4">Popular</h3></div>                
                                        <div className="image">
                                            <img src={item.img} alt="" /> 
                                        </div>
                                        <div className="content text-t">
                                            <h3 className="fw-6"><Link to="/login">{item.title}</Link></h3>
                                            <p className="font-2">{item.desc}</p>
                                        </div>    
                                    </div>
                                </div> 
                            ))
                        }   
                    </div>           
                </div>
            </div>
            {<Flathelp />}
            {<Footer data={dataFooter}/>}
            {<Bottom classNameection='widget-social-footer'/>}
        </div>
    );
}

export default ConnectWallet;