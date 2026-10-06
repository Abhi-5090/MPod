import React from 'react';
import '../scss/components/section.scss';
import Header from '.././components/header/header.jsx'
import Banner from '../components/banner/banner-v3';
import dataBanner from '../assets/fake-data/data-banner';
import Friendly from '../components/friendly/flat-friendly-v2';
import dataFriendly from '../assets/fake-data/data-friendly';
import Liveaution from '../components/liveauctions/liveauction-v3';
import dataLiveaution from '../assets/fake-data/data-liveaution';
import Category from '../components/cetagories/cetagorie-v3';
import dataCategory from '../assets/fake-data/data-category';
import Liveaution2 from '../components/liveauctions/liveauction-v4';
import dataLiveaution2 from '../assets/fake-data/data-liveaution';
import Feature from '../components/featured/featured-v1';
import dataFeature from '../assets/fake-data/data-featured';
import Seller from '../components/seller/seller-v3';
import dataSeller from '../assets/fake-data/data-seller';
import Collection from '../components/collection/collection-v1';
import dataCollection from '../assets/fake-data/data-collection';
import Flathelp from '../components/flat-help/flat-help-v1';
import Blog from '../components/blog/blog-v1';
import dataBlog from '../assets/fake-data/data-blog';
import Footer from '../components/footer/footer-v3';
import dataFooter from '../assets/fake-data/data-footer';
import Bottom from '../components/bottom';

function Home3(props) {

    return (
        <div className='wrapper-style' id='wrapper'>
            {<Header />}
            {<Banner data={dataBanner}/>}
            {<Friendly data={dataFriendly}/>}
            {<Liveaution classection='tf-section flat-auctions live-auctions home2' data={dataLiveaution}/>}
            {<Category data={dataCategory}/>}
            {<Liveaution2 data={dataLiveaution2}/>}
            {<Feature classection='tf-section flat-featured home2 home3' data={dataFeature}/>}
            {<Seller data={dataSeller}/>}
            {<Collection classection='flat-collection home3' data={dataCollection}/>}
            {<Flathelp classection='flat-help home2 home3'/>}
            {<Blog classection='tf-section flat-blog home3' data={dataBlog}/>}
            {<Footer data={dataFooter}/>}
            {<Bottom classection='widget-social-footer home3'/>}
        </div>
    );
}

export default Home3;