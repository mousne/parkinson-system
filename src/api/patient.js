/* eslint-disable quotes */
import axios from 'axios';

export function getPatientInfo() {
  var request = {
    "userId": 93242,
    "accountNumber": "15012670416",
    "userType": 1,
    "orgId": 34,
    "orgType": 2,
    "patientId": 112,
    "patientPersonVersion": 98
  };

  var url = 'http://apitest.gyenno.com/pdms/queryPatientPerson';

  // axios.post 本身就是个 Promise 对象，这里我们再用 Promise 封装一次，在本文件内对响应数据进行处理，对外只暴露有效数据
  var promise = new Promise(function(resolve) {

    axios.post(url, request).then((response) => {
      if (response.data.code === 0) {
        resolve(response.data.data);
      } else {
        console.log('参数错误: ', response.data.msg);
      }

    }).catch(function(error) {
      console.error('请求出错: ', error);
    });
  });

  return promise;
}
