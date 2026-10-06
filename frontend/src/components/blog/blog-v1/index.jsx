import React , { useState} from 'react';
import PropTypes from 'prop-types';
import BlogItem from '../blog-item';
Blog.propTypes = {
    data : PropTypes.array,
};


function Blog (props) {
    const {classection} = props;
    const {data} = props;
    const [dataTitle] = useState(
        {   
            title : 'Latest News & Blogs',
            desc: 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration.',
        }
    )
    return (
            <div className={`${classection}`}>
                <div className="container">
                    <div className="row">                  
                        <div className="col-lg-12 col-sm-12">
                            <div className="heading-section style center">
                                <h2 className="fw-5">{dataTitle.title}</h2>
                                <p>{dataTitle.desc}</p>
                            </div>
                        </div>
                        {
                            data.slice(0,3).map (item => (
                                <BlogItem key={item.id} item={item}/>
                            ))
                        }
                    </div>
                </div>
            </div>
    );
}

export default Blog;