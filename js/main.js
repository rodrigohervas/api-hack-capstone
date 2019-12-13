import { getData } from './fetch.js';
import { createMap } from './googleMaps.js';

'use strict';

$(displayError(false));
$(displayLoader(false));

/**
 * Event listener that adds a delegated onclick event to each input.readmore button that may be generated, to:
 * 1. change the button text accordingly
 * 2. call function generateMap for each restaurant card
 */
function readMore() {
    $('main').on('click', 'input.read-more', function (event) {
        const id = event.target.id;
        
        if (event.currentTarget.value == 'Read more') {
            event.currentTarget.value = 'Read less';
            generateMap(id);
        }
        else {
            event.currentTarget.value = 'Read more';
        }
        $('.read-more').next(`#description-extended-${id}`).toggle();
    });
}
$(readMore);


/**
 * Event listener for Search button, that:
 * 1. deletes any card in the UI
 * 2. hides the Error card
 * 3. starts a new search
 */
function search() {
    $('#submit').on('click', event => {
        event.preventDefault();

        clearResults();
        displayError(false);
        displayLoader(true);
        
        const params = {
            searchLocation: $('#area-search').val(),
            number: 10, 
        };
        
        manageRestaurants(params);
    })
}
$(search);


/**
 * Function that requests restaurants info and displays the result in the UI
 * 
 * @param {object} paramValues 
 */
async function manageRestaurants(paramValues) {
    try {
        const data = await getData(paramValues, 'search');
        clearResults();
        displayResults(data);
        displayLoader(false);
    }
    catch (error) {
        displayLoader(false);
        displayError(true);
    }
}


/**
 * Function that validates if a value is undefined
 * 
 * @param {object} value 
 */
function validateData(value) {
    return value != undefined ? value : 'not available';
}


/**
 * Function to compose a photo url
 * 
 * @param {object} photo 
 */
function composePhoto(photo) {
    return `${photo.prefix}300x300${photo.suffix}`;
}


/**
 * Function that returns a random number from 1 to 5, both inclusive
 */
function getRandomNumber() {
    return Math.floor(Math.random() * (5 - 1 + 1)) + 1;
}


/**
 * Function that renders the received API data into the UI
 * 
 * @param {object} data 
 */
function displayResults(data) {

    try {
        let number = 1;
        for (let venue of data) {
            const restaurant = venue.details;

            let htmlString = `
    <div id="result-card" class="result-card">

        <input type="hidden" id="lat${number}" value="${validateData(restaurant.location.lat)}">
        <input type="hidden" id="lng${number}" value="${validateData(restaurant.location.lng)}">

        <img
         id="result-card-img" src="${restaurant.bestPhoto != undefined ? composePhoto(restaurant.bestPhoto) : `./img/food-${getRandomNumber()}-300x300.jpg`}"
         alt="${validateData(restaurant.name)}" class="result-img">
        <div class="result-card-text">
            <div class="result-card-text-header">
                <div class="name-address">
                    <h2>${validateData(restaurant.name)}</h2>
                    <address>
                        <p class="street-address">
                            ${validateData(restaurant.location.address)}<br>
                            ${validateData(restaurant.location.city)}, ${validateData(restaurant.location.state)}, ${validateData(restaurant.location.postalCode)}
                        </p>
                    </address>
                </div>
                <a href="tel:${validateData(restaurant.contact.phone)}">${validateData(restaurant.contact.formattedPhone)}</a>
            </div>
            <div class="result-card-text-description" display="block">
                <p>${restaurant.description != undefined ? restaurant.description : 'description not available.'}
                </p>
            </div>
            <input id="${number}" class="read-more" type="submit" value="Read more">
            <div id="description-extended-${number}" class="result-card-text-description-extended">
                <div class="extended-container">
                    <div class="details">
                        <div id="map${number}" class="map">
                        </div>
                        <div class="hours">
                            <table caption="Hours of Operation">
                                <tr><th colspan="2"><h4>Hours of operation:</h4></th></tr>
                                <tr><th>Status:</th><td>${ restaurant.hasOwnProperty('hours') ? restaurant.hours.status : 'not available' } </td></tr>
                                ${ !(restaurant.hasOwnProperty('hours')) ? '<tr><th>Hours:</th><td>not available</td></tr>' :
                                    restaurant.hours.timeframes.map( function (timeframe) {
                                        return '<tr><th>' + validateData(timeframe.days) + ':</th><td>' + validateData(timeframe.open[0].renderedTime)
                                        + '</td></tr>'}).join('')}
                            </table>
                        </div>
                    </div>

                    ${restaurant.tips != undefined ? displayReviews(restaurant.tips) : 'test'}

                </div>
            </div>
        </div>
    </div>`;

            number++;
            $('.cards-container').append(htmlString);
        }

    }
    catch (error) {
        throw error;
    }
}

/**
 * Function that generates the HTML to render reviews, if available.
 * 
 * @param {object} reviews 
 */
function displayReviews(reviews) {
    try {
        let htmlReviews;
        if (reviews.groups.length > 0) {
            htmlReviews = `<div class="reviews"><div class="reviews-container">`;
            for (let i = 0; i < 2 && i < reviews.groups[0].items.length; i++) {

                const review = reviews.groups[0].items[i];
                htmlReviews += `<div class="review">
                <h4>${review.user.firstName} ${review.user.lastName != undefined ? review.user.lastName: ''}:</h4> 
                <q>${review.text}</q></div>`;
            }
            htmlReviews += '</div></div>';
        }
        else {
            htmlReviews = '';
        }
        return htmlReviews;
    } 
    catch (error) {
        throw error;
    }
}

/**
 * Function that collects the necessary data and calls the Google Maps API map generator
 * 
 * @param {number} id 
 */
function generateMap(id) {
    try{
        const lat = $(`div#result-card input#lat${id}`).val();
        const lng = $(`div#result-card input#lng${id}`).val();
        const canvas = document.getElementById(`map${id}`);
        createMap(canvas, lat, lng);
    }
    catch (error) {
        throw error;
    }
}

/**
 * Function that clears the HTML from the cards container
 */
function clearResults() {
    $('div.cards-container').html('');
}


/**
 * Function that toggles the visibility of the Error card
 * 
 * @param {boolean} boolean 
 */
function displayError(boolean) {
    boolean ? $('.errorDiv').show() : $('.errorDiv').hide();
}

/**
 * Function that toggles the visibility of the loader div
 * 
 * @param {boolean} boolean 
 */
function displayLoader(boolean) {
    boolean ? $('.loader').show() : $('.loader').hide();
}