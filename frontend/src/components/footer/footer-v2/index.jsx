import React , { useState ,useEffect } from 'react';
import { Link , NavLink } from 'react-router-dom';
import logo from '../../../assets/images/logo/logo_dark.png';
import Footeritem from '../footer-item';
import '../styles.scss';

function Footer(props) {
    const {data} = props;
    const [isVisible, setIsVisible] = useState(false);

    const [dataTitle] = useState(
        {
            subtitle : 'Nulla et aliquam ligula. Praesent veluar rhoncus dui, nec aliquet leo.',
        }
    )

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    };
  
    useEffect(() => {
      const toggleVisibility = () => {
        if (window.pageYOffset > 500) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      };
  
      window.addEventListener("scroll", toggleVisibility);
  
      return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    return (
        <footer id="footer" className="clearfix home2"><div className="overlay"></div>
            <div className="container">
                <div className="row">
                    <div className="col-lg-4 col-md-12 col-sm-12">
                        <div className="widget widget-logo">
                            <div className="flat-box">
                                <div className="logo-footer" id="logo-footer">
                                    <NavLink to="/" className="main-logo"><img id="logo_footer" src={logo} alt="Icoland" /></NavLink>
                                </div>
                                <p className="sub-widget-logo">{dataTitle.subtitle}</p>
                            </div>                        
                            <div className="widget-social style-1 mg-t32">
                                <ul>
                                    <li><Link to="#"><i className="fab fa-facebook-f"></i></Link></li>
                                    <li><Link to="#"><i className="fab fa-twitter"></i></Link></li>                                                               
                                    <li className="style-2"><Link to="#"><i className="fab fa-linkedin-in"></i></Link></li>
                                    <li><Link to="#"><i className="fab fa-instagram"></i></Link></li>                                    
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-2 col-md-3 col-6 col-mobi">
                        <div className="widget widget-menu style-1">
                            
                        </div>
                    </div>
                    {
                        data.slice(1,4).map (item => (
                            <Footeritem key={item.id} item={item}/>
                        ))
                    }
                </div>
            </div>
            {
                isVisible && 
                <Link onClick={scrollToTop}  to='#' id="scroll-top"></Link>
            }
                        <div className="modal fade popup" id="popup_bid" tabIndex="-1" role="dialog" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <div className="modal-body space-y-20 pd-40">
                            <h3>Place a Bid</h3>
                            <p className="text-center">You must bid at least <span className="price color-popup">4.89 ETH</span>
                            </p>
                            <input type="text" className="form-control"
                                placeholder="00.00 ETH" />
                            <p>Enter quantity. <span className="color-popup">5 available</span>
                            </p>
                            <input type="number" className="form-control" placeholder="1" />
                            <div className="hr"></div>
                            <div className="d-flex justify-content-between">
                                <p> You must bid at least:</p>
                                <p className="text-right price color-popup"> 4.89 ETH </p>
                            </div>
                            <div className="d-flex justify-content-between">
                                <p> Service free:</p>
                                <p className="text-right price color-popup"> 0,89 ETH </p>
                            </div>
                            <div className="d-flex justify-content-between">
                                <p> Total bid amount:</p>
                                <p className="text-right price color-popup"> 4 ETH </p>
                            </div>
                            <Link to="#" className="btn btn-primary" data-toggle="modal" data-target="#popup_bid_success" data-dismiss="modal" aria-label="Close"> Place a bid</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;