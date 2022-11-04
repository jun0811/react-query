import axios from "axios";

const client = axios.create({ baseURL: "http://localhost:4000" });

export const request = ({ ...options }) => {
  client.default.headers.common.Authorization = "token";
  const onSuccess = (res) => res;
  const onError = (err) => err;
  return client(options).then(onSuccess).catch(onError);
};
