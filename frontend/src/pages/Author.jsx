import React from 'react';
import '../scss/components/section.scss';
import Header from '.././components/header/header.jsx';
import PageTitle from '../components/page-title/page-title-v1';
import Author from '../components/layouts/author/author';
import dataAuthor from '../assets/fake-data/data-seller';
import Flathelp from '../components/flat-help';
import Footer from '../components/footer/footer-v1';
import dataFooter from '../assets/fake-data/data-footer';
import Bottom from '../components/bottom';

function Author1(props) {
    return (
        <div className='wrapper-style' id='wrapper'>
            {<Header />}
            <PageTitle title='Author Page'  />
            {<Author data={dataAuthor}/>}
            {<Flathelp />}
            {<Footer data={dataFooter}/>}
            {<Bottom classection='widget-social-footer'/>}
        </div>
    );
}

export default Author1;