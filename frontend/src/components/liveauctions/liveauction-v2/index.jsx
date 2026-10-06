import React , { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import Button from '../../button/button-st1';
import CardModal from '../../CardModal';
Liveauction.propTypes = {
    data : PropTypes.array,
};

function Liveauction (props) {
    const {data} = props;
    const [modalShow, setModalShow] = useState(false);

    const [dataTitle] = useState(
        {   
            title : 'Explore Assets NFTS',
            desc : 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour.',
        }
    )
    return (
        <Fragment>
            <div className="tf-section flat-explore flat-auctions">
                <div className="container">
                    <div className="row">                  
                        <div className="col-lg-12">
                            <div className="heading-section center">
                                <h2>{dataTitle.title}</h2>
                                <p>{dataTitle.desc}</p>
                            </div>
                        </div>
                        
                        {
                            data.slice(4,12).map (item => (
                                <div className="col-xl-3 col-lg-4 col-md-6" key={item.id}>
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
                                                <Link to="#" data-toggle="modal" data-target="#popup_bid" className="sc-button btn-3" onClick={() => setModalShow(true)}><span>{item.btn}</span></Link>
                                            </div>
                                        </div>
                                    </div>    	
                                </div>  
                            </div>
                            ))
                        }
            
                        <div className="col-lg-12">                                             
                            <div className="sc-btn-button center mt-30">
                                <Button title='View All More' addclass='btn-2' path='/liveAuction' />
                            </div> 
                        </div>
                    </div>
                </div>
            </div>
            <CardModal
                show={modalShow}
                onHide={() => setModalShow(false)}
            />
        </Fragment>
    );
}

export default Liveauction;