export const fetchCountries = async () => {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        if (!response.ok) {
            throw new Error(`Failed to fetch countries: ${response.status}`);
        }
        const data = await response.json();
        return data.map(country => ({
            code: country.cca2,
            name: country.name.common,
        })).sort((a, b) => a.name.localeCompare(b.name));
    } catch(error) {
        throw new Error(`Error fetching countries: ${error.message}`);
    }

};

// Function to fetch languages using public languages API
export const fetchLanguages = async () => {
    try {
        // ISO 639-1 language codes
        const response = await fetch('https://api.cognitive.microsofttranslator.com/languages?api-version=3.0');
        if(!response.ok) {
            throw new Error(`Failed to fetch Languages: ${response.status}`);
        }

        const data = await response.json();

        //Transform the data to get the language code and name
        return Object.entries(data.dictionary).map(([code, details]) => ({
            code: code,
            name: details.name
          })).sort((a, b) => a.name.localeCompare(b.name));
    } catch(error) {
        throw new Error(`Error fetching languages: ${error.message}`);
    }
};


// Function to fetch regions using GeoNames API
export const fetchRegions = async (countryCode = null) => {
    try {
        const baseUrl = 'http://api.geonames.org/searchJSON';
        const username = 'yamu'; 

        let url = `${baseUrl}?featureClass=P&featureCode=PPLA&featureCode=PPLA2&maxRows=1000&username=${username}`;

        if (countryCode) {
            url += `&country=${countryCode}`;
        }
    
        const response = await fetch(url);
        console.log("Response from GeoNames API:", response); // Debugging line
        if (!response.ok) {
            throw new Error(`Failed to fetch regions: ${response.status}`);
        }

        const data = await response.json();
        return data.geonames.map(place => ({
            id: place.geonameId,
            name: place.name,
            countryCode: place.countryCode
        })).sort((a, b) => a.name.localeCompare(b.name));
    } catch(error) {
        throw new Error(`Error fetching regions: ${error.message}`);
    }
};