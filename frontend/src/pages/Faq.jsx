import React , {useState} from 'react';
import '../scss/components/section.scss';
import Header from '.././components/header/header.jsx';
import PageTitle from '../components/page-title/page-title-v1';
import Flathelp from '../components/flat-help';
import Footer from '../components/footer/footer-v1';
import dataFooter from '../assets/fake-data/data-footer';
import Bottom from '../components/bottom';
import { Tab, Tabs, TabList, TabPanel  } from 'react-tabs';
import dataFaq from '../assets/fake-data/data-faq';
import { Accordion } from 'react-bootstrap-accordion';
function Faq(props) {


    const [dataTab] = useState(
        [
            {
                id: 1,
                title: "Nufti General Faq",
            },
        ]
    )

    return (
        <div className='wrapper-style' id='wrapper'>
            {<Header />}
            <PageTitle title='Faq'  />
            <div className="tf-section flat-faq flat-create-item">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="wrap-faq">
                                <div className="flat-tabs tab-create-item flat-form flex-one">
                                    <div className="content-inner flat-accordion">
                                        {
                                            dataFaq.slice(0,11).map(item => (
                                                <Accordion key={item.id} title={item.title} show={item.show}>
                                                <p className="toggle-content section-desc">{item.content}</p>
                                                </Accordion>
                                            ))
                                        }                                                   
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>               
                </div>
            </div>
            {<Flathelp />}
            {<Footer data={dataFooter}/>}
            {<Bottom classection='widget-social-footer'/>}
        </div>
    );
}

export default Faq;