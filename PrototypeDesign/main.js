//Quickly made GUI for a public starwars API.

//--------------GLOBALS-----------------------------
let root = "https://swapi.dev/api/";
let currentPagenum = [0, 99999]; // Current pagenr , Total Page numbers
let currentPagedata = {};

//maxpage =  floor(totalamount / items per page)

let nextLink;
let previousLink;

let currentFetchedObjects = {}; //fetched objects for one page
let selectedObject; //one person
//--------------------------------------------------

//Global GUI Selections
let rightArrowbtn = document.querySelector(".paging i.fa.fa-arrow-right");
let leftArrowbtn = document.querySelector(".paging i.fa.fa-arrow-left");
let pageCounter = document.querySelector(".paging p");
let loader = document.querySelector(".leftFlex .loader");

//--------------------------------------------------

async function fetchObjects(url) {
	let userArr;
	try {
		userArr = fetch(url).then((response) => response.json());
	} catch (error) {
		console.log(error);
	}
	return userArr;
}

//Logs result to console
async function logFetch(data) {
	data.then((data) => {
		console.log(data);
	});
}

//Fetchers
//---------------------------------------------------------------------

//Gets 10 people
//use https://swapi.dev/api/people/?page=2
async function getPageOfPeople(page) {
	let flexbox = document.querySelector(".leftFlex .flexBody");

	flexbox.classList.toggle("zeroOpacity");

	flexbox.innerHTML = "";
	loader.classList.toggle("invisible");

	let tmpstring = `https://swapi.dev/api/people/?page=${page}`;
	let mypromise = await fetchObjects(tmpstring);
	currentFetchedObjects = mypromise.results;
	nextLink = mypromise.next;
	previousLink = mypromise.previous;

	currentPagenum[0] = page;
	loader.classList.toggle("invisible");
	flexbox.classList.toggle("zeroOpacity");

	return mypromise;
}

//use https://swapi.dev/api/people/1/
async function getObjectDetails(entity, pint) {
	let tmpstring = `https://swapi.dev/api/${entity}/${pint}/`;
	let results = await fetchObjects(tmpstring);
	return results;
}

// getGetCount("people") ger 82
async function getCount(entity) {
	let tmpstring = `https://swapi.dev/api/${entity}/`;
	let results = await fetchObjects(tmpstring);
	return results.count;
}

// getPlanet("url") ger {planet object ...}
async function getPlanet(homeworld) {
	resultplanet = await fetchObjects(homeworld);
	return resultplanet;
}

//DOM Manipulators
//--------------------

function placeFetchedPeople(people) {
	let flexbox = document.querySelector(".leftFlex .flexBody");
	flexbox.innerHTML = "";

	people.forEach((x) => {
		//Places one person into the DOM
		let strinchild;
		if (selectedObject && selectedObject.innerText.trim() == x.name) {
			strinchild = `
			<div class="character">
				<span> ${x.name} </span>
				<span
					><i class="fa fa-caret-right" aria-hidden="true"></i>
				</span>
			</div>`;
		} else {
			strinchild = `
			<div class="character">
				<span> ${x.name} </span>
				<span class="invisible"
					><i class="fa fa-caret-right" aria-hidden="true"></i>
				</span>
			</div>`;
		}

		flexbox.innerHTML += strinchild;
	});
}

async function placePersonDetails(person) {
	let flexbox = document.querySelector(".detail1");

	let stringchild = `
		<p>Name: ${person.name}</p>
		<p>Height: ${person.height}</p>
		<p>Hair color: ${person.hair_color}</p>
		<p>Skin color: ${person.skin_color}</p>
		<p>Eye color: ${person.eye_color}</p>
		<p>Birth year: ${person.birth_year}</p>
		`;

	flexbox.innerHTML = stringchild;
}

async function placePlanetDetails(homeworldURL) {
	let flexbox = document.querySelector(".detail2");

	let homeworld = await fetchObjects(homeworldURL);

	let stringchild = `
			<h2>${homeworld.name}</h2> 
			<p>Rotation period: ${homeworld.rotation_period}</p> 
			<p>Orbital period: ${homeworld.orbital_period}</p> 
			<p>Diameter: ${homeworld.diameter}</p> 
			<p>Climate: ${homeworld.climate}</p> 
			<p>Gravity: ${homeworld.gravity}</p> 
			<p>Terrain: ${homeworld.terrain}</p> 
			<p>Surface water: ${homeworld.surface_water}</p> 
			<p>Population: ${homeworld.population}</p> 
		`;
	flexbox.innerHTML = stringchild;
}

async function nextPage() {
	if (nextLink) {
		myguys = await getPageOfPeople(currentPagenum[0] + 1);
		placeFetchedPeople(myguys.results);
		reAssignEventsListeners();
		updateButtons();
	}
}

async function previousPage() {
	if (previousLink) {
		myguys = await getPageOfPeople(currentPagenum[0] - 1);
		placeFetchedPeople(myguys.results);
		reAssignEventsListeners();
		updateButtons();
	}
}

//Updates arrowButtons style after click
function updateButtons() {
	if (!nextLink) {
		rightArrowbtn.classList.add("disabled");
	} else if (rightArrowbtn.classList.contains("disabled")) {
		rightArrowbtn.classList.toggle("disabled");
	}

	if (!previousLink) {
		leftArrowbtn.classList.add("disabled");
	} else if (leftArrowbtn.classList.contains("disabled")) {
		leftArrowbtn.classList.toggle("disabled");
	}

	pageCounter.textContent = `${currentPagenum[0]} / ${currentPagenum[1]}`;
}

//GLOBAL EVENTLISTENERS
rightArrowbtn.addEventListener("click", nextPage, true);
leftArrowbtn.addEventListener("click", previousPage, false);

//Only run on page visit.
async function init() {
	var myguys = await getPageOfPeople(1);
	placeFetchedPeople(myguys.results);

	let maxPage = Math.ceil(myguys.count / 10);
	currentPagenum = [1, maxPage];

	let person = myguys.results[1];
	await placePersonDetails(person);
	await placePlanetDetails(person.homeworld);

	reAssignEventsListeners();
	updateButtons();
}

function reAssignEventsListeners() {
	people = document.querySelectorAll(".character");

	people.forEach((x) => {
		x.addEventListener("click", (event) => {
			clickedGuy = currentFetchedObjects.filter(
				(fetched) => fetched.name == x.innerText
			)[0];

			previousMark = document.querySelectorAll(
				"div.character > span:nth-child(2):not(.invisible)"
			);

			if (previousMark.length > 0) {
				previousMark[0].classList.toggle("invisible");
			}

			x.childNodes[3].classList.toggle("invisible");

			if (!selectedObject) {
				selectedObject = x;
			} else if (selectedObject.innerText.trim() != x.innerText) {
				selectedObject = x;
			}

			guy = getCachedPersonByName(x.innerText);

			placePersonDetails(guy);
			placePlanetDetails(guy.homeworld);
		});
	});
}

//"http://swapi.dev/api/people/1/" ger ett personobj
function getCachedPersonByURL(url) {
	let tmpguy = currentFetchedObjects.filter(
		(x) => x.url == "http://swapi.dev/api/people/1/"
	)[0];
	return tmpguy;
}

function getCachedPersonByName(pname) {
	let tmpguy = currentFetchedObjects.filter(
		(fetched) => fetched.name == pname
	)[0];
	return tmpguy;
}

let people = document.querySelectorAll(".character");

init();
