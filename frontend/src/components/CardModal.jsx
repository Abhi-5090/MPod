import React from 'react';
import { Link } from 'react-router-dom'
import { Modal } from "react-bootstrap";

const CardModal = (props) => {
    
return (

    <Modal
    show={props.show}
    onHide={props.onHide}
  >
    <Modal.Header closeButton></Modal.Header>
        <div className="modal-body space-y-20 pd-40">
            <h2>Place a Bid</h2>
            <p className="text-center">You must bid at least <span className="price color-popup">2.39 ETH</span>
            </p>
            <input type="text" className="form-control" placeholder="00.00 ETH" />
            <p>Enter quantity. <span className="color-popup">1 available</span>
            </p>
            <input type="text" placeholder='1' className="form-control quantity" />
            <div className="hr"></div>
                                    
            <div className="d-flex justify-content-between">
                <p> Current Bid</p>
                <p className="text-right price color-popup"> 2.39 ETH </p>
            </div>
            <Link to="/connectwallet" className="btn btn-primary" data-toggle="modal" data-target="#popup_bid_success"
                data-dismiss="modal" aria-label="Close"> Place a bid</Link>
        </div>
    </Modal>
    
  );
};

export default CardModal;
