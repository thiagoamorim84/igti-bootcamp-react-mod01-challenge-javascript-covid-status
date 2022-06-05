const apiCovid = axios.create({
  baseURL: "https://api.covid19api.com/",
});

async function apiCountries() {
  let res = await apiCovid.get("countries");
  return res?.data;
}

async function apiCountryAllStatus(selectedCountry, dateStart, dateEnd) {
  let res = await apiCovid.get(
    "country/" + selectedCountry + "?from=" + dateStart + "&to=" + dateEnd
  );
  return res?.data;
}

async function init() {
  const data = await apiCountries();
  renderCountries(data);
}
init();

let cmbCountries = document.getElementById("cmbCountry");

function renderCountries(data) {
  countries = data.sort((a, b) => a.Country.localeCompare(b.Country));

  let btnApply = document.getElementById("filtro");

  for (const c of countries) {
    const option = document.createElement("option");
    option.textContent = c.Country;
    option.value = c.Slug;
    option.selected = c.ISO2 === "BR";
    cmbCountries.appendChild(option);
  }

  btnApply.addEventListener("click", aplicar);
}

async function aplicar() {
  let selectedCountry = cmbCountries.value;

  let dateStart = document.getElementById("date_start").value;
  let dateEnd = document.getElementById("date_end").value;

  let dt = dateFns.parse(dateStart, "yyyy-MM-dd");
  dateStart = dateFns.subDays(dt, 1);

  const results = await apiCountryAllStatus(
    selectedCountry,
    dateStart,
    dateEnd
  );
  renderData(results);
}

function renderData(results) {
  console.log(results);

  let data = document.getElementById("cmbData").value;
  let dates = _.map(_.tail(results), "Date");

  const labels = dates.map((d) =>
    dateFns.format(d.substring(0, d.indexOf("T")), "DD-MM-YYYY")
  );

  let valores = _.map(results, data);
  let firstValue = _.first(valores);
  let otherValues = _.tail(valores);

  let valoresIncrementos = [];
  let previousValue = firstValue;
  for (value of otherValues) {
    valoresIncrementos.push(value - previousValue);
    previousValue = value;
  }

  let average = _.sum(valoresIncrementos) / valoresIncrementos.length;

  linhas.data.datasets[0].data = valoresIncrementos;
  linhas.data.datasets[1].data = Array(valoresIncrementos.length).fill(average);
  linhas.data.labels = labels;
  linhas.update();

  let confirmedArray = _.map(results, "Confirmed");
  let deathsArray = _.map(results, "Deaths");
  let recoveredArray = _.map(results, "Recovered");

  let totalConfirmed = _.last(confirmedArray) - _.first(confirmedArray);
  let totalDeaths = _.last(deathsArray) - _.first(deathsArray);
  let totalRecovered = _.last(recoveredArray) - _.first(recoveredArray);

  document.getElementById("kpiconfirmed").innerText =
    totalConfirmed?.toLocaleString("es");
  document.getElementById("kpideaths").innerText =
    totalDeaths?.toLocaleString("es");
  document.getElementById("kpirecovered").innerText =
    totalRecovered?.toLocaleString("es");

  console.log(dates);
  console.log(valoresIncrementos);
}

let linhas = new Chart(document.getElementById("linhas"), {
  type: "line",
  data: {
    datasets: [
      {
        label: "Número",
        borderColor: "rgb(255,140,13)",
        backgroundColor: "rgb(255,140,13, 0.1)",
      },
      {
        label: "Média",
        borderColor: "rgb(60,186,159)",
        backgroundColor: "rgb(60,186,159,0.1)",
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top", //top, bottom, left, rigth
      },
      title: {
        display: true,
        text: "Curva diária de Covid-19",
      },
      layout: {
        padding: {
          left: 100,
          right: 100,
          top: 50,
          bottom: 10,
        },
      },
    },
  },
});
