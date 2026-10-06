import React from 'react';
import PropTypes from 'prop-types';
import '../styles.scss'

PageTitle.propTypes = {
    title: PropTypes.string,
};

function PageTitle(props) {

    const {title} = props;

    return (
        <section className="flat-title-page inner"> 
            <img src={require ('../../../assets/images/mark/mark-header-04.png')} alt="Nufti" className="absolute mark-page"/>
            <img src={require ('../../../assets/images/mark/mark-header-01.png')} alt="Nufti" className="absolute mark-page2 animate-rotate"/>
            <img src={require ('../../../assets/images/mark/mark-header-02.png')} alt="Nufti" className="absolute mark-page3"/>
            <img src={require ('../../../assets/images/mark/mark-header-03.png')} alt="Nufti" className="absolute mark-page4"/>
            <img src={require ('../../../assets/images/mark/mark-header-05.png')} alt="Nufti" className="absolute mark-page5"/>
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="page-title-heading">
                            <h1 className="heading">{title}<span className="text-color-3">.</span></h1>
                        </div>                        
                    </div>
                </div>
            </div>                    
        </section>
    );
}

export default PageTitle;