import React, { useEffect, useState } from "react"
import {
    Row,
    Col,
    Card,
    CardBody,
    CardTitle,
    Modal,
    Badge,
    Button,
    Offcanvas,
    OffcanvasHeader,
    OffcanvasBody,
} from "reactstrap"

import { batch, connect } from "react-redux";


import axios from "axios";
//Import Action to copy breadcrumb items from local state to redux state
import { setBreadcrumbItems } from "../../store/actions";
import { MutatingDots } from 'react-loader-spinner';

const Hall3_2 = (props) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    document.title = "Hall 3.1 | VLSI";

    const breadcrumbItems = [
        { title: "Driveready", link: "#" },
        { title: "VLSI", link: "/hall-3-1" },
        { title: "Hall 3-1", link: "/hall-3-1" },
    ];

    const [users, setUser] = useState();
    const [modal_center, setmodal_center] = useState(false)
    //contains the selected user information
    const [selectedUser, setSelectedUser] = useState()
    const [isRight, setIsRight] = useState(false);
    const [attendances, setAttendances] = useState()
    let all_users;
    let all_users_attendances = [];
    const [equal100, setEqual100] = useState()
    const [between9099, setBetween9099] = useState()
    const [between7089, setBetween7089] = useState()
    const [between5069, setBetween5069] = useState()
    const [below50, setBelow50] = useState()
    const [batchDetails, setBatchDetails] = useState();
    const [blocked, setBlocked] = useState();
    const [dropped, setDropped] = useState();
    const [hold, setHold] = useState();
    const [isloading, setIsLoading] = useState(true);


    //Setting Right Canvas
    const toggleRightCanvas = () => {
        setEqual100(all_users_attendances.filter(ele => ele == 100).length)
        setBetween9099(all_users_attendances.filter(ele => ele >= 90 && ele <= 99).length)
        setBetween7089(all_users_attendances.filter(ele => ele >= 70 && ele <= 89).length)
        setBetween5069(all_users_attendances.filter(ele => ele >= 50 && ele <= 69).length)
        setBelow50(all_users_attendances.filter(ele => ele < 50).length)
        setIsRight(!isRight);
    };
    useEffect(() => {
        props.setBreadcrumbItems('Heatmap', breadcrumbItems);
    }, [])


    useEffect(() => {
        setIsLoading(true)
        //getting users based on batch and technology
        try {
            axios.post(backendUrl + "get-trainer-interns-by-batchid", { batch: "6662b25714d2c08772b3ff58" }).then((response) => {
                setBatchDetails(response.data)
            })

            axios.post(backendUrl + "get-students-by-course-and-technology", { course_id: "66487408f07c5f0f567ee3c3", technology_id: "664879fe1e898c8c6143ab85" }).then((response) => {
                let userss = response.data
                setUser(response.data);
                //Block status count
                setBlocked(userss.filter((ele) => {
                    return ele.userInfo.block_status == 1
                }))
                //Drop status Count
                setDropped(userss.filter((ele) => {
                    return ele.userInfo.drop_status == 1
                }))
                setHold(userss.filter((ele) => {
                    return ele.userInfo.hold_status == 1
                }))
            })

            axios.post(backendUrl + "get-batchwise-attendance", { batch_id: "6662b25714d2c08772b3ff58", technology_id: "664879fe1e898c8c6143ab85" }).then((response) => {
                setIsLoading(false)
                setAttendances(response.data)
            })
        } catch (err) {
            console.log(err)
            setIsLoading(true)
        }
    }, [])

    function tog_center() {
        setmodal_center(!modal_center)
        removeBodyCss()
    }

    function removeBodyCss() {
        document.body.classList.add("no_padding")
    }
    const getData = (seat_no) => {
        let color;
        if (typeof (users && attendances) != 'undefined') {
            //checking the user existance
            let cur = users.find(user => user.userInfo.seat_no === seat_no)
            console.log(cur)
            let attend;
            if (cur) {

                if (typeof (attendances) != 'undefined') {
                    attend = attendances.find(attend => attend.studentInfo[0]._id === cur.userInfo._id)
                }
                //if attendance is not found for then keeping the attendance value is zero because of no attended sessions
                if (!attend) {
                    // cur.attendance = Math.floor(Math.random() * 101)
                    cur.attendance = 0;
                    all_users_attendances.push(cur.attendance)
                } else {
                    cur.attendance = ((attend.attended_sessions / attend.total_sessions) * 100).toFixed(2)          //calculating the attendance percentage based on the total and total_attended sessions
                    all_users_attendances.push(cur.attendance)
                }
            }
            return (
                <button
                    type="button"
                    className="btn btn-primary waves-effect waves-light"
                    onClick={() => {
                        setSelectedUser(cur)
                        tog_center()
                    }}
                    data-toggle="modal"
                    style={{ background: "transparent", color: "black", border: "none", padding: "0px", width: "150px" }}
                    data-target=".bs-example-modal-center">
                    <div className={cur && cur.userInfo.block_status == 1 || cur && cur.userInfo.drop_status ? "border border-danger border-opacity-25 bg-danger p-2 text-reset bg-opacity-50 col-md-12" : cur && cur.attendance == 100 ? "border border-primary border-opacity-25 bg-success p-2 text-white col-md-12" : cur && cur.attendance >= 90 && cur.attendance < 100 ? "border border-primary border-opacity-25 bg-success p-2 text-white bg-opacity-75 col-md-12" : cur && cur.attendance >= 70 && cur.attendance < 90 ? "border border-primary border-opacity-25 bg-success p-2 text-reset bg-opacity-50 col-md-12" : cur && cur.attendance >= 50 && cur.attendance < 70 ? "border border-primary border-opacity-25 bg-success p-2 text-reset bg-opacity-25 col-md-12" : cur && cur.attendance < 50 ? "border border-primary border-opacity-25 bg-success p-2 text-reset bg-opacity-10 col-md-12" : "border border-primary border-opacity-25 col-md-12"} style={{ borderRadius: "3px", marginBottom: "5px", height: "85px" }}>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="text-center">
                                {cur && cur.userInfo.gender == "female" ? <img src="/admin/female.svg" height="25px" width="25px" /> : cur && cur.userInfo.gender == "male" ?<img src="/admin/male.svg" height="25px" width="25px" />:""}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="text-center" style={{ fontSize: "10px" }}>
                                    {seat_no}
                                </div>

                            </div>
                        </div>

                        <div className="text-center">
                            <p className="h6">{typeof (attend) != 'undefined' ? cur && cur.attendance + "%" : cur && cur.attendance + "%"}</p>
                            {/* {cur && typeof (cur.attendance) != "undefined" ? cur.attendance + "%" : "-"} */}
                        </div>
                        <div className="text-center" style={{ fontSize: "10px" }}>
                            {cur && cur.userInfo.roll_no}
                        </div>

                    </div>
                </button>
            )
        }
    }

    return (
        <React.Fragment>
            {/* Modal starts */}
            <Modal
                isOpen={modal_center}
                toggle={() => {
                    tog_center()
                }}
                centered={true}
            >
                <div className="modal-header">
                    <h3>
                        {typeof (selectedUser) != 'undefined' ? selectedUser.userInfo.first_name : ''}
                    </h3>
                    <button
                        type="button"
                        onClick={() => {
                            setmodal_center(false)
                        }}
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"

                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    <div className="text-center">
                        {typeof (selectedUser) != 'undefined' ?
                            // <img className="rounded rounded-circle" style={{ height: "200px", width: "200px" }} src=></img> 
                            <img
                                className="rounded-circle mt-4 mt-sm-0"
                                alt="Trainee"
                                width="200"
                                src={process.env.REACT_APP_BACKEND_IMAGE_URL + "profile-pics/" + selectedUser.userInfo.profile_pic}
                            />
                            : ''}
                    </div>

                    <p className="h5 mb-4">
                        College : {typeof (selectedUser) != 'undefined' ? selectedUser.userInfo.college : ''}
                    </p>
                    <p className="h5 mb-4">
                        Branch : {typeof (selectedUser) != 'undefined' ? selectedUser.userInfo.branch : ''}
                    </p>
                    <p className="h5 mb-4">
                        Blocked Status : {typeof (selectedUser) != 'undefined' ? selectedUser.userInfo.block_status == 0 ? <Badge color="primary" className="bg-primary">Not Blocked</Badge> : <Badge color="danger" className="bg-danger">Blocked</Badge> : ''}
                    </p>
                    <p className="h5 mb-4">
                        Dropped Status : {typeof (selectedUser) != 'undefined' ? selectedUser.userInfo.drop_status == 0 ? <Badge color="primary" className="bg-primary">Not Dropped</Badge> : <Badge color="danger" className="bg-danger">Dropped</Badge> : ''}
                    </p>
                    <p className="h5 mb-4">
                        Hold Status : {typeof (selectedUser) != 'undefined' ? selectedUser.userInfo.hold_status == 0 ? <Badge color="primary" className="bg-primary">Not Hold</Badge> : <Badge color="danger" className="bg-danger">Hold</Badge> : ''}
                    </p>
                </div>
            </Modal>

            {/* modal ends */}

            <Offcanvas
                isOpen={isRight}
                direction="end"
                toggle={toggleRightCanvas}>
                <OffcanvasHeader toggle={toggleRightCanvas}>
                    Heatmap Deep dive
                </OffcanvasHeader>
                <OffcanvasBody>
                    <div className="row">

                        <div className="row">
                            <div className="col-md-12">
                                <h4 className="h5 mb-4">Primary Trainer</h4>
                            </div>
                            <div className="col-md-12">
                                <p className="h6 mb-4">
                                    {batchDetails ? batchDetails.primary_trainer : "Loading..."}
                                </p>
                            </div>
                            <hr></hr>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <h4 className="h5 mb-4">Secondary Trainers</h4>
                            </div>
                            <div className="col-md-12">
                                {batchDetails ? batchDetails.secondary_trainers.map((ele) => {
                                    return (<p className="h6 mb-4">{ele}</p>)
                                }) : "Loading"
                                }
                            </div>
                            <hr></hr>

                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <h4 className="h5 mb-4">Interns</h4>
                            </div>
                            <div className="col-md-12">
                                {batchDetails ? batchDetails.interns.map((ele) => {
                                    return (<p className="h6 mb-4">{ele}</p>)
                                }) : "Loading"
                                }
                            </div>
                            <hr></hr>

                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <h4 className="h5 mb-4">Attendance</h4>
                            </div>
                            <div className="col-md-12">
                                <h5 className="h5 mb-4">100% : {<Badge color="info" className="bg-info large-badge">{equal100}</Badge>} </h5>
                                <h5 className="h5 mb-4">90-99% : <Badge color="info" className="bg-info large-badge">{between9099}</Badge></h5>
                                <h5 className="h5 mb-4">70-89% : <Badge color="info" className="bg-info large-badge">{between7089}</Badge></h5>
                                <h5 className="h5 mb-4">50-69% : <Badge color="info" className="bg-info large-badge">{between5069}</Badge></h5>
                                <h5 className="h5 mb-4">Below 50% : <Badge color="info" className="bg-info large-badge">{below50}</Badge></h5>
                            </div>
                            <hr></hr>

                        </div>
                        <div className="row">
                            <div className="col-md-4">
                                <h4 className="h5 mb-4">Blocked <Badge color="danger" className="bg-danger large-badge">{blocked ? blocked.length : "Loading..."}</Badge></h4>

                            </div>

                            <div className="col-md-4">
                                <h4 className="h5 mb-4">Dropped <Badge color="danger" className="bg-danger large-badge">{dropped ? dropped.length : "Loading..."}</Badge></h4>
                            </div>

                            <div className="col-md-4">
                                <h4 className="h5 mb-4">Hold <Badge color="danger" className="bg-danger large-badge">{hold ? hold.length : "Loading..."}</Badge></h4>
                            </div>
                            <hr></hr>

                        </div>

                        <div className="row">



                        </div>


                    </div>
                </OffcanvasBody>
            </Offcanvas>
            <div className="row">
                <div className="offset-10 col-md-2 text-left">
                    <Button color="primary" onClick={toggleRightCanvas}>Deepdive</Button>
                </div>
            </div>
            {isloading ? (
                <div className="row">
                    <div className="col-md-2 offset-5">

                        <div style={{ margin: "auto 0px" }} className="text-center mt-4">
                            <MutatingDots
                                height={100}
                                width={100}
                                color="#2B3A4A"
                                secondaryColor="#2B3A4A"
                                radius={12.5}
                                ariaLabel="mutating-dots-loading"
                            />
                        </div>
                    </div>
                </div>
            ) : (
            <div className="row" style={{ marginLeft: "35px" }}>
                <h2 className="text-center h2 mb-4">{batchDetails && batchDetails.technology_name}</h2>

                <div className="col-md-4">
                    <div className="row h5 mb-4 text-center">POOL-1</div>
                    <div className="row">
                        <div className="col-md-2">
                            <div className="row">
                                {
                                    getData("L1A1")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L1B1")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L1C1")
                                }

                            </div>
                            <div className="row">
                                {
                                    getData("L1D1")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L1E1")
                                }
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="row">
                                {
                                    getData("L2A2")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L2B2")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L2C2")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L2D2")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L2E2")
                                }
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="row">
                                {
                                    getData("L3A3")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L3B3")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L3C3")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L3D3")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L3E3")
                                }
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="row">
                                {
                                    getData("L4A4")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L4B4")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L4C4")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L4D4")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L4E4")
                                }
                            </div>

                        </div>
                        <div className="col-md-2">
                            <div className="row">
                                {
                                    getData("L5A5")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L5B5")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L5C5")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L5D5")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L5E5")
                                }
                            </div>
                        </div>
                    </div>
                    {/* <div className="row text-center h5 mb-4" style={{marginTop:"30px"}}>POOL-3(Female)</div> */}
                    <div className="row">
                        <div className="col-md-2">
                            <div className="row">
                                {
                                    getData("L1F1")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L1G1")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L1H1")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L1I1")
                                }
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="row">
                                {
                                    getData("L2F2")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L2G2")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L2H2")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L2I2")
                                }
                            </div>

                        </div>
                        <div className="col-md-2">
                            <div className="row">
                                {
                                    getData("L3F3")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L3G3")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L3H3")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L3I3")
                                }
                            </div>

                        </div>
                        <div className="col-md-2">
                            <div className="row">
                                {
                                    getData("L4F4")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L4G4")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L4H4")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L4I4")
                                }
                            </div>

                        </div>
                        <div className="col-md-2">
                            <div className="row">
                                {
                                    getData("L5F5")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L5G5")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L5H5")
                                }
                            </div>
                            <div className="row">
                                {
                                    getData("L5I5")
                                }
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            )}
        </React.Fragment>
    )
}

export default connect(null, { setBreadcrumbItems })(Hall3_2);