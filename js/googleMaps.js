export function createMap(canvas, lat, lng) {
    try {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);

        var mapOptions = {
            zoom: 18,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: true,
            fullscreenControl: false
        }

        mapOptions.center = new google.maps.LatLng(latitude, longitude);
        const map1 = new google.maps.Map(canvas, mapOptions);

        let marker = new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: map1
        });
    }
    catch (error){
        //console.log(`Error in createMap(): ${error.message}`);
    }
}

