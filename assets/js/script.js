let searchLocation = document.querySelector('.search');
let city = document.querySelector('.city');
let day = document.querySelector('.day');
let humidity = document.querySelector('.indicator-humidity>.value');
let wind = document.querySelector('.indicator-wind>.value');
let pressure = document.querySelector('.indicator-pressure>.value');
let image = document.querySelector('.image');
let temperature = document.querySelector('.temperature>.value');
let description = document.querySelector('.temperature-description>.value');
let forecastBlock = document.querySelector('.forecast');
let citySuggestions = document.querySelector('#suggestions');


let weatherImages = [
    {
        url: 'assets/images/clear-sky.png',
        ids: [800]
    },
    {
        url: 'assets/images/broken-clouds.png',
        ids: [803, 804]
    },
    {
        url: 'assets/images/few-clouds.png',
        ids: [801]
    },
    {
        url: 'assets/images/mist.png',
        ids: [701, 711, 721, 731, 741, 751, 761, 762, 771, 781]
    },
    {
        url: 'assets/images/rain.png',
        ids: [500, 501, 502, 503, 504]
    },
    {
        url: 'assets/images/scattered-clouds.png',
        ids: [802]
    },
    {
        url: 'assets/images/shower-rain.png',
        ids: [300, 301, 302, 310, 311, 312, 313, 314, 321, 520, 521, 522, 531]
    },
    {
        url: 'assets/images/snow.png',
        ids: [511, 600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622]
    },
    {
        url: 'assets/images/thunderstorm .png',
        ids: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232]
    }
]

let ApiKey = 'a98843d3bf83e2531b98396a4c10bf87';
let BaseEndPoint = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + ApiKey;
let forecastEndPoint = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=' + ApiKey;
let cityBaseEndPoint = 'https://api.teleport.org/api/cities/?search=';

let getByCityName = async (cityString) => {
    let city;
    if (cityString.includes(',')) {
        city = cityString.substring(0, cityString.indexOf(',')) + cityString.substring(cityString.lastIndexOf(','));
    } else {
        city = cityString;
    }
    let endPoint = BaseEndPoint + '&q=' + city;
    let response = await fetch(endPoint);
    if (response.status !== 200) {
        alert('City Not Found');
        return;
    }
    return await response.json();
}
let getForecastByCityID = async (id) => {
    let endPoint = forecastEndPoint + '&id=' + id;
    let result = await fetch(endPoint);
    let forecast = await result.json();
    let forecastList = forecast.list;
    let daily = [];

    forecastList.forEach(day => {
        let date = new Date(day.dt_txt.replace(' ', 'T'));
        let hours = date.getHours();
        if (hours === 12) {
            daily.push(day);
        }
    })
    return daily;
}

let weatherForCity = async (city) => {
    let weather = await getByCityName(city);
    if (!weather) {
        return;
    }
    let cityID = weather.id;
    updateWeather(weather);
    let forecast = await getForecastByCityID(cityID);
    updateForecast(forecast);
}

let init = () => {
    weatherForCity('Dhaka').then(()=>document.body.style.filter='blur(0)');
}
    init();

searchLocation.addEventListener('keydown', async (e) => {
    if (e.keyCode === 13) {
        weatherForCity(searchLocation.value);
    }
})

searchLocation.addEventListener('input', async () => {
    let endPoint = cityBaseEndPoint + searchLocation.value;
    let result = await (await fetch(endPoint)).json();
    citySuggestions.innerHTML = '';
    let cities = result._embedded['city:search-results'];
    let length = cities.length > 5 ? 5 : cities.length;
    for (let i = 0; i < length; i++) {
        let option = document.createElement('option');
        option.value = cities[i].matching_full_name;
        citySuggestions.appendChild(option)
    }
})


let updateWeather = (data) => {
    city.textContent = data.name + ', ' + data.sys.country;
    day.textContent = dayOfWeek();
    humidity.textContent = data.main.humidity;
    pressure.textContent = data.main.pressure;
    description.textContent = data.weather[0].description;
    let windDirection;
    let deg = data.wind.deg;
    if (deg > 45 && deg <= 135) {
        windDirection = 'East';
    } else if (deg > 135 && deg <= 225) {
        windDirection = 'South';
    } else if (deg > 225 && deg <= 315) {
        windDirection = 'West';
    } else {
        windDirection = 'North';
    }
    wind.textContent = windDirection + ', ' + data.wind.speed;

    temperature.textContent = data.main.temp > 0 ?
        '+' + Math.round(data.main.temp)
        : Math.round(data.main.temp);
    let imgID = data.weather[0].id
    weatherImages.forEach(obj => {
        if (obj.ids.includes(imgID)) {
            image.src = obj.url;
        }
    })
}

let updateForecast = (forecast) => {
    forecastBlock.innerHTML = '';
    forecast.forEach(day => {
        let iconUrl = 'http://openweathermap.org/img/wn/' + day.weather[0].icon + '@2x.png';
        let dayName = dayOfWeek(day.dt * 1000);
        let temp = day.main.temp > 0 ?
            '+' + Math.round(day.main.temp)
            : Math.round(day.main.temp);
        let weatherDescription = day.weather[0].description
        let forecastItem = `
        <article class="forecast-item">
            <img class="forecast-icon" src="${iconUrl}" alt="${day.weather[0].description}" >
            <h6 class="forecast-details">${weatherDescription}</h6>
            <h3 class="forecast-day">${dayName}</h3>
            <p class="forecast-temperature"><span class="value">${temp}</span>&deg;C</p>
        </article>
        `;
        forecastBlock.insertAdjacentHTML('beforeend', forecastItem);
    })

}
let dayOfWeek = (dt = new Date().getTime()) => {
    return new Date(dt).toLocaleDateString('en-EN', {'weekday': 'long'})
}




