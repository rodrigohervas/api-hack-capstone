import { configuration } from './configuration.js';

'use strict';

/* Variables for Foursquare */
const clientId = configuration.clientId;
const clientSecret = configuration.clientSecret;
const venueCategory = configuration.venueCategory;
const dataType = configuration.dataType;            
const radius = configuration.radius;
const v = configuration.v;
const urlSearch = configuration.urlSearch;
const urlDetails = configuration.urlDetails;

/**
 * Function that processes the parameter object necessary for the API request Url
 * 
 * @param {object} paramValues 
 * @param {string} searchType 
 * @param {number} restaurantId 
 */
function composeUrl(paramValues, searchType, restaurantId = 0) {
    let params = {
        client_id: clientId, 
        client_secret: clientSecret, 
        v: v
    };

    if (searchType === 'search') {
        params.near = paramValues.location;
        params.query = dataType;
        params.categoryId = venueCategory;
        params.radius = radius;
        params.limit = paramValues.number;
    }

    return generateUrl(params, searchType, restaurantId);
}

/**
 * Function that generates the parameter querystring for the API request Url
 * 
 * @param {object} params 
 */
function generateQueryString(params) {
    let queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);

    return queryItems.join('&');
}

/**
 * Function that generates the API request Url
 * 
 * @param {object} params 
 * @param {string} searchType 
 * @param {number} restaurantId 
 */
function generateUrl(params, searchType, restaurantId = 0) {
    const queryString = generateQueryString(params);
    if (searchType === 'search') {
        return urlSearch + '?' + queryString;
    }
    else if (searchType === 'details') {
        return urlDetails + restaurantId + '?' + queryString;
    }
}

/**
 * Fetch API function
 * 
 * @param {object} paramValues 
 * @param {string} searchType 
 * @param {number} restaurantId 
 */
async function asyncFetchData(paramValues, searchType, restaurantId = 0) {
    try {
        const url = composeUrl(paramValues, searchType, restaurantId);
        
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error ${response.status}: error fetching data`);
        }

        const responseJson = await response.json();
        
        return responseJson;
    }
    catch (error) {
        throw error;
    }
}

/**
 * Data Service in charge of getting data from fetcher, and formatting it for return
 * 
 * @param {object} paramValues 
 * @param {string} searchType 
 */
export async function getData(paramValues, searchType) {
    try {
        const data = await asyncFetchData(paramValues, searchType);
        for(const item of data.response.venues) {
            
            item.details = (await asyncFetchData(paramValues, 'details', item.id)).response.venue;
        }
        return data.response.venues;
    } 
    catch (error) {
        throw error;
    }
}

