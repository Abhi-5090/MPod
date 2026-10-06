import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
Blog.propTypes = {
    item: PropTypes.object,
};


function Blog(props) {
    const {item} = props;

    return (
        <div className="fl-blog fl-item2">
            <article className="sc-card-article blog-article">
            
                <div className={`card-media ${item.classAction}`}>
                    <Link to="/blog-details"><img className="img-item" src={item.img} alt="" /></Link>
                    </div>    
                <div className="post">
                    <div className="text-article">
                        <h3><Link to="/blog-details">{item.title}</Link></h3>
                        <p>{item.desc}</p>
                    </div>
                    <div className="meta-info style">
                        <div className="author">
                            <div className="avatar">
                                <img src={item.imgavatar} alt="" />
                            </div>
                            <div className="info">
                                <h5> By<Link className="text-color-3" to="/author">{item.author}</Link> </h5>
                                <div className="date"> Date <span className="text-color-6">{item.date}</span></div>                                           
                            </div>
                        </div>                                  
                    </div>
                </div>                                                                                                                
            </article>
        </div>
    );
}

export default Blog;