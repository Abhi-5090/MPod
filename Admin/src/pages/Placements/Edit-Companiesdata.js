import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Button, Label } from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";

const AddCompany = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    document.title = "Technical Hub | Add Company";

    const [data, setData] = useState({
        company_name: '',
        percentage: '',
        backlogs: '',
        branches: '',
        industry: '',
        higest_package: '',
        createdAt: '',
        addedby: '',
        status: ''
    });
    const [rolePackage, setRolePackage] = useState([]);
    const [rounds, setRounds] = useState([{ round: '' }]);
    const [skills, setSkills] = useState([{ skill: '' }]);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [addedby, setAddedBy] = useState("");
    const [industrySelectedGroup, setIndustrySelectedGroup] = useState(null);

    useEffect(() => {
        let authUser = JSON.parse(localStorage.getItem('authUser'));
        if (authUser.role == 'admin' || authUser.role == 'superadmin') {
        }
        else {
          alert("your not autherized")
          localStorage.clear();
          window.location.href = '/admin/login';
        }
      }, []);

    useEffect(() => {
        const curr_user = JSON.parse(localStorage.getItem('authUser'));
        if (curr_user) {
            setAddedBy(curr_user.roll_no);
        }
        if (id) {
            const backendUrl = process.env.REACT_APP_BACKEND_URL;
            axios.get(backendUrl+`getdatabyid/${id}`)
                .then(response => {
                    const companyData = response.data;
                    setData({
                        company_name: companyData.company_name || '',
                        percentage: companyData.percentage || '',
                        backlogs: companyData.backlogs || '',
                        branches: companyData.branches || '',
                        industry: companyData.industry || '',
                        higest_package: companyData.higest_package || '',
                        createdAt: companyData.createdAt || '',
                        addedby: companyData.addedby || '',
                        status: companyData.status || ''
                    });
                    setRolePackage(companyData.Role || []);
                    setRounds(companyData.Section_process || [{ round: '' }]);
                    setSkills(companyData.skillset || [{ skill: '' }]);
                    setPreviewUrl(companyData.company_big_Logo || '');
                    setIndustrySelectedGroup({ label: companyData.industry, value: companyData.industry });
                })
                .catch(error => {
                    console.error('Error fetching company data:', error);
                });
        }
    }, [id]);

    const industryOptionGroup = [
        {
            options: [
                { label: "IT", value: "IT" },
                { label: "Core", value: "Core" },
            ]
        },
    ];

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleIndustrySelectGroup = (selectedOption) => {
        setIndustrySelectedGroup(selectedOption);
        setData({ ...data, industry: selectedOption.value });
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        const fileReader = new FileReader();
        fileReader.onload = () => {
            setPreviewUrl(fileReader.result);
        };
        fileReader.readAsDataURL(event.target.files[0]);
    };

    const updateCompany = async () => {
        const roles = rolePackage.map((role) => ({
            role: role.role,
            package: role.package
        }));

        const final_selection_process = rounds.map((round) => ({
            round: round.round
        }));

        const final_skillset = skills.map((skill) => ({
            skill: skill.skill
        }));

        const formData = new FormData();
        formData.append('company_big_Logo', file);
        formData.append('company_name', data.company_name);
        formData.append('percentage', data.percentage);
        formData.append('backlogs', data.backlogs);
        formData.append('branches', data.branches);
        formData.append('higest_package', data.higest_package);
        formData.append('industry', industrySelectedGroup.value);
        formData.append('addedby', addedby);
        formData.append('status', data.status);
        formData.append('Role', JSON.stringify(roles));
        formData.append('Section_process', JSON.stringify(final_selection_process));
        formData.append('skillset', JSON.stringify(final_skillset));

        try {
            const backendUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await axios.put(backendUrl+`update-companyinfo/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.status === 200) {
                toast.success('Company Info updated successfully', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                });
                navigate(`/companyInfo`);
            } else {
                console.log('Unexpected response:', response);
            }
        } catch (error) {
            console.error('Error updating company info:', error);
            const status = error.response ? error.response.status : null;
            let errorMessage = 'An unexpected error occurred';
            if (status === 400) {
                errorMessage = 'Please fill in all required fields correctly.';
            } else if (status === 500) {
                errorMessage = 'Something went wrong';
            }
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        updateCompany();
    };

    return (
        <React.Fragment>
            <Row>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                    transition={Bounce}
                />
                <Col xl="12">
                    <Card>
                        <CardBody>
                            <AvForm className="needs-validation" onSubmit={handleSubmit}>
                                <Row>
                                    <Col md="4">
                                        <div className="mb-3">
                                            <Label htmlFor="companyName">Company Name</Label>
                                            <AvField
                                                name="company_name"
                                                placeholder="Enter Company name"
                                                type="text"
                                                errorMessage="Insert Company Name"
                                                className="form-control"
                                                validate={{ required: { value: true } }}
                                                id="companyName"
                                                value={data.company_name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </Col>
                                    <Col md="4">
                                        <div className="mb-3">
                                            <Label className="form-label">Company Logo</Label><br />
                                            {previewUrl && <img src={previewUrl} alt="Company Logo" width="50px" />}
                                            <input type="file" name="file" className="form-control form-control-file" data-buttonname="btn-secondary" onChange={handleFileChange} />
                                        </div>
                                    </Col>
                                    <Col md="4">
                                        <div className="mb-3">
                                            <Label>Industry</Label>
                                            <Select
                                                options={industryOptionGroup[0].options}
                                                value={industrySelectedGroup}
                                                onChange={handleIndustrySelectGroup}
                                            />
                                        </div>
                                    </Col>
                                </Row>

                                <Row>
                                    <legend>Roles</legend>
                                    {rolePackage.map((role, i) => (
                                        <React.Fragment key={i}>
                                            <Col md="4">
                                                <div className="mb-3">
                                                    <Label htmlFor={`role_${i + 1}`}>Role {i + 1}</Label>
                                                    <AvField
                                                        name={`role_${i + 1}`}
                                                        placeholder={`Role ${i + 1}`}
                                                        type="text"
                                                        errorMessage={`Insert Role ${i + 1}`}
                                                        className="form-control"
                                                        id={`role_${i + 1}`}
                                                        value={role.role || ''}
                                                        onChange={(e) => setRolePackage((prev) => {
                                                            const newRolePackage = [...prev];
                                                            newRolePackage[i].role = e.target.value;
                                                            return newRolePackage;
                                                        })}
                                                    />
                                                </div>
                                            </Col>
                                            <Col md="4">
                                                <div className="mb-3">
                                                    <Label htmlFor={`package_${i + 1}`}>Package {i + 1}</Label>
                                                    <AvField
                                                        name={`package_${i + 1}`}
                                                        placeholder={`Package ${i + 1}`}
                                                        type="text"
                                                        errorMessage={`Insert Package ${i + 1}`}
                                                        className="form-control"
                                                        id={`package_${i + 1}`}
                                                        value={role.package || ''}
                                                        onChange={(e) => setRolePackage((prev) => {
                                                            const newRolePackage = [...prev];
                                                            newRolePackage[i].package = e.target.value;
                                                            return newRolePackage;
                                                        })}
                                                    />
                                                </div>
                                            </Col>
                                        </React.Fragment>
                                    ))}
                                    <Col md="4">
                                        <div className="mt-3">
                                            <Button color="primary" onClick={() => setRolePackage([...rolePackage, { role: '', package: '' }])}>Add Role</Button>
                                        </div>
                                    </Col>
                                </Row>

                                <Row>
                                    <legend>Selection Process</legend>
                                    {rounds.map((round, i) => (
                                        <Col md="4" key={i}>
                                            <div className="mb-3">
                                                <Label htmlFor={`round_${i + 1}`}>Round {i + 1}</Label>
                                                <AvField
                                                    name={`round_${i + 1}`}
                                                    placeholder={`Round ${i + 1}`}
                                                    type="text"
                                                    errorMessage={`Insert Round ${i + 1}`}
                                                    className="form-control"
                                                    id={`round_${i + 1}`}
                                                    value={round.round || ''}
                                                    onChange={(e) => setRounds((prev) => {
                                                        const newRounds = [...prev];
                                                        newRounds[i].round = e.target.value;
                                                        return newRounds;
                                                    })}
                                                />
                                            </div>
                                        </Col>
                                    ))}
                                    <Col md="4">
                                        <div className="mt-3">
                                            <Button color="primary" onClick={() => setRounds([...rounds, { round: '' }])}>Add Round</Button>
                                        </div>
                                    </Col>
                                </Row>

                                <Row>
                                    <legend>Skill Set</legend>
                                    {skills.map((skill, i) => (
                                        <Col md="4" key={i}>
                                            <div className="mb-3">
                                                <Label htmlFor={`skill_${i + 1}`}>Skill {i + 1}</Label>
                                                <AvField
                                                    name={`skill_${i + 1}`}
                                                    placeholder={`Skill ${i + 1}`}
                                                    type="text"
                                                    errorMessage={`Insert Skill ${i + 1}`}
                                                    className="form-control"
                                                    id={`skill_${i + 1}`}
                                                    value={skill.skill || ''}
                                                    onChange={(e) => setSkills((prev) => {
                                                        const newSkills = [...prev];
                                                        newSkills[i].skill = e.target.value;
                                                        return newSkills;
                                                    })}
                                                />
                                            </div>
                                        </Col>
                                    ))}
                                    <Col md="4">
                                        <div className="mt-3">
                                            <Button color="primary" onClick={() => setSkills([...skills, { skill: '' }])}>Add Skill</Button>
                                        </div>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md="4">
                                        <div className="mb-3">
                                            <Label htmlFor="percentage">Percentage</Label>
                                            <AvField
                                                name="percentage"
                                                placeholder="Enter Percentage"
                                                type="text"
                                                errorMessage="Insert Percentage"
                                                className="form-control"
                                                validate={{ required: { value: true } }}
                                                id="percentage"
                                                value={data.percentage}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </Col>
                                    <Col md="4">
                                        <div className="mb-3">
                                            <Label htmlFor="backlogs">Backlogs</Label>
                                            <AvField
                                                name="backlogs"
                                                placeholder="Enter Backlogs"
                                                type="text"
                                                errorMessage="Insert Backlogs"
                                                className="form-control"
                                                validate={{ required: { value: true } }}
                                                id="backlogs"
                                                value={data.backlogs}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </Col>
                                    <Col md="4">
                                        <div className="mb-3">
                                            <Label htmlFor="branches">Branches</Label>
                                            <AvField
                                                name="branches"
                                                placeholder="Enter Branches"
                                                type="text"
                                                errorMessage="Insert Branches"
                                                className="form-control"
                                                validate={{ required: { value: true } }}
                                                id="branches"
                                                value={data.branches}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md="4">
                                        <div className="mb-3">
                                            <Label htmlFor="higest_package">Highest Package</Label>
                                            <AvField
                                                name="higest_package"
                                                placeholder="Enter Highest Package"
                                                type="text"
                                                errorMessage="Insert Highest Package"
                                                className="form-control"
                                                validate={{ required: { value: true } }}
                                                id="higest_package"
                                                value={data.higest_package}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </Col>
                                    <Col md="4">
                                        <div className="mb-3">
                                            <Label htmlFor="status">Status</Label>
                                            <AvField
                                                name="status"
                                                placeholder="Enter Status"
                                                type="text"
                                                errorMessage="Insert Status"
                                                className="form-control"
                                                validate={{ required: { value: true } }}
                                                id="status"
                                                value={data.status}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </Col>
                                </Row>

                                <Button color="primary" type="submit">Submit</Button>
                            </AvForm>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </React.Fragment>
    );
};

export default AddCompany;
