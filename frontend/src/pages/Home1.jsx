import React from 'react';
import '../scss/components/section.scss';
import Header from '.././components/header/header.jsx'
import Banner from '../components/banner/banner-v1';
import dataBanner from '../assets/fake-data/data-banner';
import Category from '../components/cetagories/cetagorie-v1';
import dataCategory from '../assets/fake-data/data-category';
import Liveaution from '../components/liveauctions/liveauction-v1';
import dataLiveaution from '../assets/fake-data/data-liveaution';
import Seller from '../components/seller/seller-v1';
import dataSeller from '../assets/fake-data/data-seller';
import Liveaution2 from '../components/liveauctions/liveauction-v2';
import dataLiveaution2 from '../assets/fake-data/data-liveaution';
import Friendly from '../components/friendly';
import dataFriendly from '../assets/fake-data/data-friendly';
import Collection from '../components/collection/collection-v1';
import dataCollection from '../assets/fake-data/data-collection';
import Brand from '../components/brand/brand-v1';
import dataBrand from '../assets/fake-data/data-brand';
import Flathelp from '../components/flat-help';
import Footer from '../components/footer/footer-v1';
import dataFooter from '../assets/fake-data/data-footer';
import Bottom from '../components/bottom';
import Blog from '../components/blog/blog-v1';
import dataBlog from '../assets/fake-data/data-blog';
import Feature from '../components/featured/featured-v1';
import dataFeature from '../assets/fake-data/data-featured';
function HomeOne(props) {

    return (
        <div className='wrapper-style' id='wrapper'>
            {<Header />}
            {<Banner data={dataBanner}/>}
            {<Blog classection='tf-section flat-blog home3' data={dataBlog}/>}

            {/* {<Category data={dataCategory}/>} */}
            {/* {<Liveaution data={dataLiveaution}/>} */}
            {/* {<Seller data={dataSeller}/>} */}
            {/* {<Liveaution2 data={dataLiveaution2}/>} */}
            {<Friendly data={dataFriendly}/>}
            {/* {<Collection classection='flat-collection seller style2' data={dataCollection}/>} */}
            {<Feature classection='tf-section flat-featured home2' data={dataFeature}/>}
            {<Brand classection='tf-section flat-brand' data={dataBrand}/>}

            {/* {<Flathelp />} */}
            {<Footer data={dataFooter}/>}
            {<Bottom classection='widget-social-footer'/>}
        </div>
    );
}

export default HomeOne;