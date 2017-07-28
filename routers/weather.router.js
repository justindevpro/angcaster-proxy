const express = require('express');
const router = express.Router();
const axios = require('axios');
// const { apiKey, googApiKey } = require('../credentials');
const apiKey =  process.env.API_KEY || require('../credentials').apiKey;
const googApiKey = process.env.GOOG || require('../credentials').googApiKey;
const base = 'https://api.darksky.net/forecast';
const baseGeo = `https://maps.googleapis.com/maps/api/geocode/json?key=${googApiKey}&address=`;
const baseRevGeo = `https://maps.googleapis.com/maps/api/geocode/json?key=${googApiKey}&latlng=`;

router.get('/weather/:lat,:lon', (req, res, next) => {
  const {lat, lon} = req.params;
  const url = `${base}/${apiKey}/${lat},${lon}`;
  const locationUrl = `${baseRevGeo}${lat},${lon}`;
  const gets = [url, locationUrl].map(axios.get);
  axios.all(gets)
       .then(results => results.map(result => result.data))
       .then(finals => {
         const [weatherData, googData] = finals;
         weatherData.location = googData.results[0].formatted_address;
         res.status(200).json(weatherData);
       })
       .catch(err => res.status(500).json(err));
});

router.get('/weather/location/:location', (req, res) => {
  const geoUrl = `${baseGeo}${req.params.location}`;
  axios.get(geoUrl)
       .then(response => response.data)
       .then(locationData => {
         const {lat, lng} = locationData.results[0].geometry.location;
         const url = `${base}/${apiKey}/${lat},${lng}`;
         return axios.get(url)
       })
       .then(weatherResponse => res.status(200).json(weatherResponse.data))
       .catch(err => res.status(500).json(err));
})

module.exports = router;







//
