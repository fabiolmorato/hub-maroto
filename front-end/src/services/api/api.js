import axios from 'axios';

export default function createApiInstance (token) {
  const methods = [
    'get',
    'post',
    'put',
    'delete'
  ];

  const axiosWrapper = {};

  const queryStringBuilder = query => Object.keys(query).length ? '?' + Object.keys(query).map(k => `${k}=${query[k]}`).join('&') : '';

  const instance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL
  });

  for (const method of methods) {
    axiosWrapper[method] = async function (route, body, query = {}, complete = false) {
      try {
        const url = `${route}${queryStringBuilder(query)}`;

        const request = await instance({
          method,
          url,
          data: body,
          headers: {
            ...(token && {
              Authorization: `Bearer ${token}`
            })
          }
        });

        return complete ? request : request.data;
      } catch (err) {
        console.error(err);
        return Promise.reject(err.response);
      }
    }
  }

  return axiosWrapper;
}
