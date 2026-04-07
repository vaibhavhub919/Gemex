import { toast } from "react-toastify";

const baseOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true
};

export const getErrorMessage = (error, fallback = "Something went wrong.") =>
  error?.response?.data?.message || fallback;

export const notifySuccess = (message, options = {}) =>
  toast.success(message, { ...baseOptions, ...options });

export const notifyError = (message, options = {}) =>
  toast.error(message, { ...baseOptions, ...options });

export const notifyInfo = (message, options = {}) =>
  toast.info(message, { ...baseOptions, ...options });
