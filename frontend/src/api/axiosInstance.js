import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_PUBLIC_BACKEND_URL,
    withCredentials: true, 
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.log(error.response)
        if (error.response && error.response.status === 401) {
            console.log("it is executing")
        
            // try {
            //     await axios.post(`${process.env.REACT_APP_PUBLIC_BACKEND_URL}update-session-token`, {});
            // } catch (err) {
            //     console.error("Error clearing session:", err);
            // }
            // alert("Session expired. Please login again.");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
