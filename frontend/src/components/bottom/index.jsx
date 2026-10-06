import React , { useState} from 'react';
import { Link  } from 'react-router-dom';
import Listitem from './bottom-item';
import PropTypes from 'prop-types';
Bottom.propTypes = {
    dataList : PropTypes.array,
};
function Bottom(props) {
    const {classection} = props;
    const [dataTitle] = useState(
        {   
            author : '@ThemesFlat',
        }
    )
    const [dataList] = useState(
        [
            {
                id: 1,
                title: 'About Us',
                link : '/about',
            },
            {
                id: 2,
                title: 'Connect & Wallet',
                link : '/connectwallet',
            },
            {
                id: 3,
                title: 'Blog Details',
                link : '/blog-details',
            },
            {
                id: 4,
                title: 'Contact',
                link : '/contact',
            },
            {
                id: 5,
                title: 'FAQ',
                link : '/Faq',
            },
        ]
    )

    return (
        <div className={`${classection}`}>
            <div className="container">
                <div className="row">
                    <div className="col-lg-7 col-md-12">
                        <div className="widget widget-menu bottom">                                                                  
                            <ul className="flex link-style-1">
                                    {
                                        dataList.map(item =>(
                                            <Listitem key={item.id} item={item}/>
                                        ))
                                    }
                            </ul>
                        </div>
                    </div>
                    <div className="col-lg-5 col-md-12">
                        <div className="title-bottom font text-color-1">© 2022 NFT by <Link to='#' className="text-color-3">{dataTitle.author}</Link>. All rights reserved.</div>                      
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Bottom;