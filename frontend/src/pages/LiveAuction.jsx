import React from 'react';
import '../scss/components/section.scss';
import Header from '.././components/header/header.jsx';
import PageTitle from '../components/page-title/page-title-v1';
import LiveAuction from '../components/layouts/liveaution/liveaution';
import dataLiveAuction from '../assets/fake-data/data-liveaution';
import Flathelp from '../components/flat-help';
import Footer from '../components/footer/footer-v1';
import dataFooter from '../assets/fake-data/data-footer';
import Bottom from '../components/bottom';

function LiveAuction1(props) {

    return (
        <div className='wrapper-style' id='wrapper'>
            {<Header />}
            <PageTitle title='Live Auctions'/>
            {<LiveAuction data={dataLiveAuction}/>}
            {<Flathelp />}
            {<Footer data={dataFooter}/>}
            {<Bottom classection='widget-social-footer'/>}
        </div>
    );
}

export default LiveAuction1;