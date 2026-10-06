import React from 'react';
import '../../scss/components/section.scss';
import Header from '../../components/header/header.jsx'
import Rules from '../../components/rules-details/rules-v3';
import dataBanner from '../../assets/fake-data/data-banner';


function Home3(props) {
    const {data} = props;
    console.log(data)
    return (
        <div className='wrapper-style' id='wrapper'>          
            {<Rules data={data}/>}          
        </div>
    );
}

export default Home3;