import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_MPOD_BACKEND_URL,
    withCredentials: true, 
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL
            try {
                console.log("it is called")
                // const response = await axios.get(`${backendUrl}/update-session-token`);
                // if (response.status === 200) {        
                    alert("Session expired. Please login again.");
                    window.location.href = "/admin/login"; 
                // }
            } catch (err) {
                console.error("Error updating session token:", err);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
