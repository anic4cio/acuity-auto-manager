const axios = require('axios');

// to generate this auth args, go to Acuity Scheduling API Quick Start
const user_id = 27806772
const api_key = 'd7fccc8d8ecb9c3d363eab7a039d2792';

// get all appointments
(async () => {
  const options = {
    method: 'GET',
    url: 'https://acuityscheduling.com/api/v1/appointments',
    params: { max: '100', canceled: 'false', excludeForms: 'false', direction: 'DESC' },
    headers: {
      accept: 'application/json',
      authorization: 'Basic Mjc4MDY3NzI6ZDdmY2NjOGQ4ZWNiOWMzZDM2M2VhYjdhMDM5ZDI3OTI='
    }
  };

  try {
    axios.request(options)
      .then(response => {
        const res = response.json()
        console.log(res);
      })
      .catch(error => {
        console.error(error);
      });
  } catch (error) {
    console.log(error);
  }

});

// get all calendars
(async () => {
  const options = {
    method: 'GET',
    url: 'https://acuityscheduling.com/api/v1/calendars',
    headers: {
    accept: 'application/json',
    authorization: 'Basic Mjc4MDY3NzI6ZDdmY2NjOGQ4ZWNiOWMzZDM2M2VhYjdhMDM5ZDI3OTI='
    }
  };
  try {
    const req = await axios.request(options)
      .then(res => console.log(res.data))
      .catch(err => console.error(err));
    console.log(req);
  } catch (error) {
    console.log(error);
  }
})

// call method to cancel appointment
(async () => {
  const options = {
    method: 'PUT',
    url: 'https://acuityscheduling.com/api/v1/appointments/id/cancel',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: 'Basic Mjc4MDY3NzI6ZDdmY2NjOGQ4ZWNiOWMzZDM2M2VhYjdhMDM5ZDI3OTI='
    },
    data: {noShow: false}
  };

  axios.request(options)
    .then(response => console.log(response.data))
    .catch(error => console.error(error));
})()