const axios = require('axios');
require('dotenv').config();

const token = process.env.HUBSPOT_API_KEY;
const baseURL = 'https://api.hubapi.com/';
const endpoint = 'crm/v3/objects/companies?limit=100&properties=people,name,phone,email,mailing_address,dot_number,mc_number,ff.number,interstate_drivers,cdl_drivers,ff_number';
let companies;

//get all the companies, filter and return the latest company
const getCompanies = async () => {
    const response = await axios.get(`${baseURL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      companies = response.data.results.reduce((latest, company) => {
        return new Date(latest.properties.createdate) > new Date(company.properties.createdate) ? latest : company;
      });
    }).catch(error => {
      console.error('Error fetching data:', error);
    });
    
    return companies;
}

const convertDate = (isoDate) => {
  const date = new Date(isoDate);
  const readableDate = date.toLocaleString();

  return readableDate;
}

const tcase =(str) => {
    return str.toLowerCase().split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

module.exports = {
    getCompanies,
    convertDate,
    tcase
};

