import React, {useState} from 'react';
import PropTypes from 'prop-types';
Flathelp.propTypes = {
    data : PropTypes.array,
};

function Flathelp (props) {
    const {classection} = props;
    const [dataTitle] = useState(
        {   
            title : 'Have Any Help to Newsletter.',
        }
        
    )
    console.log(classection)
    return (
        <div className={`${classection}`} style={{marginTop:"20%", height:"800px"}}>
        <div className="themes-container3 style-container">
            <div className="row">                  
                <div className="col-lg-4 offset-1 col-md-4">
                    <div className="title-help">
                        <h2>{"Interviewee"}</h2>
                        <h2>{"ID"}</h2>
                    </div>                           
                </div>
                <div className="col-lg-6 col-md-6">
                    <div className="widget-subcribe">
                        <div className="form-subcribe">
                            <form id="subscribe-form" action="#" method="GET" acceptCharset="utf-8" className="form-submit">
                                <input name="email" className="email" type="email" placeholder="Enter Your Id..." required />
                                <button id="submit" name="submit" type="submit"><i className="far fa-long-arrow-right"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    </div>
    );
}

export default Flathelp;