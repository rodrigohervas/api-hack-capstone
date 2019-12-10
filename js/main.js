import { getData } from './fetch.js';
import { createMap } from './googleMaps.js';

'use strict';

$(displayError(false));
$()

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


/* Event Listener for User Action */
function search() {
    $('#submit').on('click', event => {
        event.preventDefault();

        clearResults();
        displayError(false);
        
        const params = {
            location: $('#area-search').val(),
            number: 10, 
        };

        manageRestaurants(params);
    })
}
$(search);


/* load restaurants info into local objects */
async function manageRestaurants(paramValues) {
    try {
        const data = await getData(paramValues, 'search');
        clearResults();
        displayResults(data);
        
    }
    catch (error) {
        //console.error(`Error in manageRestaurants: ${error.message}`);
        displayError(true);
        
    }
}


/* validate that the fetch data is not undefined */
function validateData(value) {
    return value != undefined ? value : 'not available';
}


/* Function to compose the photo url */
function composePhoto(photo) {
    return `${photo.prefix}300x300${photo.suffix}`;
}


/* returns a random number to compose default photo url */
function getRandomNumber() {
    return Math.floor(Math.random() * (5 - 1 + 1)) + 1;
}


/* Render HTML with data */
function displayResults(data) {

    try {
        let number = 1;
        for (let venue of data) {
            const restaurant = venue.details;

            let htmlString = `
    <div id="result-card" class="result-card">

        <input type="hidden" id="lat${number}" value="${validateData(restaurant.location.lat)}">
        <input type="hidden" id="lng${number}" value="${validateData(restaurant.location.lng)}">

        <img id="result-card-img" src="${restaurant.bestPhoto != undefined ? composePhoto(restaurant.bestPhoto) : `./img/food-${getRandomNumber()}-300x300.jpg`}"
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
        //console.log(`Error en displayResults(): ${error.message}`);
    }
}

function displayReviews(reviews) {
    try {
        let htmlReviews;
        if (reviews.groups.length > 0) {
            htmlReviews = `<div class="reviews"><div class="reviews-container">`;
            for (let i = 0; i < 2; i++) {
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
        //console.log(`Error in displayReview(): ${error.message}`);
    }
}

function generateMap(id) {
    try{
        const lat = $(`div#result-card input#lat${id}`).val();
        const lng = $(`div#result-card input#lng${id}`).val();
        const canvas = document.getElementById(`map${id}`);
        createMap(canvas, lat, lng);
    }
    catch (error) {
        //console.log(`Error in generateMap(): ${error.message}`);
    }
}

function clearResults() {
    $('div.cards-container').html('');
    //console.log('cards cleared.');
}


/* Function to display an error on the UI */
function displayError(boolean) {
    boolean ? $ ('.errorDiv').show() : $('.errorDiv').hide();
}


