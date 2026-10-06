import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

Collection.propTypes = {
    item: PropTypes.object,
};


function Collection(props) {
    const {item} = props;

    return (
        <div className="fl-blog fl-item2">
            <article className="sc-card-article blog-article style-article">
                <div className="flat-tabs card-media media">                                 
                    <div className="content-tab content-img">
                        <div className="content-inner tab-content">
                            <img src={item.img} alt="" />
                        </div>
                    </div>
                    <ul className="menu-tab menu-img">
                        <li className="item-title">
                            <img src={item.imgconlection1} alt="" />
                        </li>
                        <li className="item-title">
                            <img src={item.imgconlection2} alt="" />
                        </li>
                        <li className="item-title">
                            <img src={item.imgconlection3} alt="" />
                        </li>
                    </ul>
                </div>
                <div className="post">
                    <div className="text-article">
                        <h3><Link to="/popular-collections">{item.title}</Link></h3>                                             
                    </div>
                    <div className="meta-info">
                        <div className="author">                                                    
                            <div className="avatar">
                                <img src={item.imgavt} alt="" />
                                <img className="check" src={item.icon} alt="" />
                            </div>
                            <div className="info">
                                <h5> By<Link className="text-color-3" to="/author">{item.author}</Link> </h5>
                                <div className="date"> In <span>{item.date}</span></div>                                           
                            </div>
                            </div>
                        <div>
                            <div className="item-nft flex-one">                                                       
                                <img className="img-nft" src={item.icon2} alt="" />
                                <h4>{item.countitem}</h4>
                            </div>
                        </div>                                  
                    </div> 
                </div> 
                                                                                                                                                            
            </article>
        </div>
    );
}

export default Collection;