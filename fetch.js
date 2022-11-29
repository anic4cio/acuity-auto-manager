(async () => { 

  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: 'Basic Mjc4MDY3NzI6ZDdmY2NjOGQ4ZWNiOWMzZDM2M2VhYjdhMDM5ZDI3OTI='
    },
    body: JSON.stringify({smsOptIn: false})
  };

  try {    
    const response = await fetch('https://acuityscheduling.com/api/v1/appointments', options)
      .then(response => response.json())
      .then(response => console.log(response))
      .catch(err => console.error(err));
  
    console.log(response)
  } catch (error) {
    console.log(error)
  }

})()
