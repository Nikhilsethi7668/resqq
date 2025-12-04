const fs = require('fs');
const path = require('path');

// Load locations data
const locationsPath = path.join(__dirname, '../data/locations.json');
const locationsData = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));

/**
 * Get all states
 */
const getAllStates = () => {
    return locationsData.states.map(state => ({
        name: state.name,
        code: state.code
    }));
};

/**
 * Get cities for a specific state
 */
const getCitiesByState = (stateName) => {
    const state = locationsData.states.find(
        s => s.name.toLowerCase() === stateName.toLowerCase()
    );
    return state ? state.cities : [];
};

/**
 * Search states with fuzzy matching
 */
const searchStates = (query) => {
    if (!query || query.trim() === '') {
        return getAllStates();
    }

    const searchTerm = query.toLowerCase().trim();

    return locationsData.states
        .filter(state => {
            const stateName = state.name.toLowerCase();
            const stateCode = state.code.toLowerCase();

            // Exact match
            if (stateName === searchTerm || stateCode === searchTerm) {
                return true;
            }

            // Starts with
            if (stateName.startsWith(searchTerm)) {
                return true;
            }

            // Contains
            if (stateName.includes(searchTerm)) {
                return true;
            }

            // Fuzzy match (allows for spelling errors)
            return levenshteinDistance(stateName, searchTerm) <= 2;
        })
        .map(state => ({
            name: state.name,
            code: state.code
        }))
        .slice(0, 10); // Limit to 10 results
};

/**
 * Search cities with fuzzy matching
 */
const searchCities = (query, stateName = null) => {
    if (!query || query.trim() === '') {
        if (stateName) {
            return getCitiesByState(stateName);
        }
        return [];
    }

    const searchTerm = query.toLowerCase().trim();
    let statesToSearch = locationsData.states;

    // Filter by state if provided
    if (stateName) {
        statesToSearch = locationsData.states.filter(
            s => s.name.toLowerCase() === stateName.toLowerCase()
        );
    }

    const results = [];

    statesToSearch.forEach(state => {
        state.cities.forEach(city => {
            const cityLower = city.toLowerCase();

            // Exact match
            if (cityLower === searchTerm) {
                results.push({ city, state: state.name });
                return;
            }

            // Starts with
            if (cityLower.startsWith(searchTerm)) {
                results.push({ city, state: state.name });
                return;
            }

            // Contains
            if (cityLower.includes(searchTerm)) {
                results.push({ city, state: state.name });
                return;
            }

            // Fuzzy match
            if (levenshteinDistance(cityLower, searchTerm) <= 2) {
                results.push({ city, state: state.name });
            }
        });
    });

    return results.slice(0, 20); // Limit to 20 results
};

/**
 * Validate state name
 */
const validateState = (stateName) => {
    return locationsData.states.some(
        state => state.name.toLowerCase() === stateName.toLowerCase()
    );
};

/**
 * Validate city name (optionally within a state)
 */
const validateCity = (cityName, stateName = null) => {
    if (stateName) {
        const state = locationsData.states.find(
            s => s.name.toLowerCase() === stateName.toLowerCase()
        );
        if (!state) return false;

        return state.cities.some(
            city => city.toLowerCase() === cityName.toLowerCase()
        );
    }

    // Check if city exists in any state
    return locationsData.states.some(state =>
        state.cities.some(city => city.toLowerCase() === cityName.toLowerCase())
    );
};

/**
 * Get normalized state name (correct capitalization)
 */
const getNormalizedStateName = (stateName) => {
    const state = locationsData.states.find(
        s => s.name.toLowerCase() === stateName.toLowerCase()
    );
    return state ? state.name : stateName;
};

/**
 * Get normalized city name (correct capitalization)
 */
const getNormalizedCityName = (cityName, stateName = null) => {
    if (stateName) {
        const state = locationsData.states.find(
            s => s.name.toLowerCase() === stateName.toLowerCase()
        );
        if (!state) return cityName;

        const city = state.cities.find(
            c => c.toLowerCase() === cityName.toLowerCase()
        );
        return city || cityName;
    }

    // Search all states
    for (const state of locationsData.states) {
        const city = state.cities.find(
            c => c.toLowerCase() === cityName.toLowerCase()
        );
        if (city) return city;
    }

    return cityName;
};

/**
 * Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

module.exports = {
    getAllStates,
    getCitiesByState,
    searchStates,
    searchCities,
    validateState,
    validateCity,
    getNormalizedStateName,
    getNormalizedCityName
};
