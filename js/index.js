const HOST = 'server.com/';

const searchInput = document.getElementsByClassName('search__bar__input')[0];
const suggestionElement = document.getElementsByClassName(
	"search__suggestions__list"
)[0];
const actionsElement = document.getElementsByClassName("search__actions")[0];

function wrapBoldedCharacters({ inputValue, suggestion }) {
	if (suggestion.startsWith(inputValue)) {
		return `${suggestion.substring(
			0,
			inputValue.length
		)}<b>${suggestion.substring(inputValue.length, suggestion.length)}</b>`;
	}
	return `<b>${suggestion}</b>`;
}

function createSuggestionElement({ suggestion, auxillaryData }) {
    const auxillaryString = auxillaryData ? `- ${auxillaryData}` : "";
    const boldProcessedSuggestion = wrapBoldedCharacters({
        inputValue: searchInput.value,
        suggestion
    });
    return `<li class="search__suggestions__list__result">${suggestion}${boldProcessedSuggestion}${auxillaryString}</li>`;
}

function onSuggestionsResponse(data) {
    const suggestionElement = document.getElementsByClassName('search__suggestions__list')[0];
    let suggestionsHTML = "";
    for (const suggestion of data) {
        suggestionsHTML += createSuggestionElement({
            suggestion: suggestion.suggestion,
            auxillaryData: suggestion.auxillary
        });
    }
    suggestionElement.innerHTML = suggestionsHTML;
    if (suggestionsHTML) {
        actionsElement.classList.add("search__actions--autosuggest");
    } else {
        actionsElement.classList.remove("search__actions--autosuggest");
    }
}

function onNewInput(event) {
    if (searchInput.value) {
        api.get(HOST + 'autocomplete', searchInput.value, onSuggestionsResponse);
    } else {
        suggestionElement.innerHTML ='';
        actionsElement.classList.remove("search__actions--autosuggest");
    }
}
searchInput.oninput = onNewInput;

//Server

function getRandomString({ length }) {
    const characterChoices =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ";
    const characters = [];
    while (characters.length < length) {
        const randommIndex = Math.floor(Math.random() * characterChoices.length);
        characters.push(characterChoices[randommIndex]);
    }
    return characters.join('');
}

function getRandomInteger({ min, max }) {
    return Math.floor(Math.random() * (max - min) + min);
}

function generateSuggestion(prefix) {
    const RATIO_EXACT_MATCH = 0.3;
    const RATIO_AUTOCORRECT = 0.1;

    if (Math.random() < RATIO_AUTOCORRECT) {
        return getRandomString({ length: getRandomInteger({ min: 1, max: prefix.length }) });
    }

    if (Math.random() < RATIO_EXACT_MATCH) {
        return prefix;
    }
    return prefix + getRandomString({ length: getRandomInteger({ min: 1, max: 10 }) });
}


function getAutoCompleteHandler(data) {
    const MAX_CHARS = 10;
    const NUM_AUTOCOMPLETE_RESULTS = 10;
    const RATIO_AUXULIARY_DATA = 0.1;

    if (data.length > MAX_CHARS) {
        return [];
    }

    const results = [];
    while (results.length < NUM_AUTOCOMPLETE_RESULTS) {
        const suggestion = generateSuggestion(data)

        if (results.find(result => result.suggestion === suggestion)) {
            continue;
        }

        if (Math.random() < RATIO_AUXULIARY_DATA) {
            for (let i = 0; i < 2; i++) {
                results.push({
                    suggestion,
                    auxillary: getRandomString({ length: getRandomInteger({ min: 5, max: 15 }) })
                });
            }
        } else {
            results.push({ suggestion, auxillary: "" });
        }
    }
    return results;
}

const endpoints = {
	"/": {
		get: () => "hello world",
	},
	"/autocomplete": {
		get: getAutoCompleteHandler,
	},
};

// API library

function getFunction(url, data, callback) {
	const domain = url.substring(0, url.indexOf("/"));
	const endpoint = url.substring(url.indexOf("/"), url.length);

	callback(endpoints[endpoint]["get"](data));
}

const api = {
	get: getFunction,
};