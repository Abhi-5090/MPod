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
        <div>
            <footer id="footer" className="clearfix home3">
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
            </footer>
             {
                isVisible && 
                <Link onClick={scrollToTop}  to='#' id="scroll-top"></Link>
            }
        </div>
    );
}

export default Footer;