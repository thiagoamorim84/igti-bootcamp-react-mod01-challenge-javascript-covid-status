const apiCovid = axios.create({
  baseURL: "https://api.covid19api.com/",
});

async function getSummary() {
  let res = await apiCovid.get("summary");
  return res?.data;
}

async function init() {
  const data = await getSummary();
  renderData(data);
}
init();

let pizza = new Chart(document.getElementById("pizza"), {
  type: "pie",
  data: {
    labels: ["Confirmados", "Recuperados", "Mortes"],
    datasets: [
      {
        backgroundColor: ["#0000CC", "#00CC00", "#CC0000"],
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Distribuição de novos casos",
      },
    },
  },
});

let bar = new Chart(document.getElementById("barras"), {
  type: "bar",
  data: {
    datasets: [
      {
        backgroundColor: "#CC0000",
      },
    ],
  },
  options: {
    reponsive: true,
    plugins: {
      legend: {
        position: "top",
        display: false,
      },
      title: {
        display: true,
        text: "Total de Mortes por país - Top 10",
      },
    },
  },
});

function renderData(data) {
  let global = data?.Global;

  let totalConfirmed = global?.TotalConfirmed;
  let totalDeaths = global?.TotalDeaths;
  let totalRecovered = global?.TotalRecovered;
  let date = global?.Date;

  let countries = data?.Countries;

  countries = countries.sort((a, b) => {
    return b.TotalDeaths - a.TotalDeaths;
  });

  let topten = _.take(countries, 10);

  document.getElementById("confirmed").textContent =
    totalConfirmed?.toLocaleString("es");
  document.getElementById("death").textContent =
    totalDeaths?.toLocaleString("es");
  document.getElementById("recovered").textContent =
    totalRecovered?.toLocaleString("es");

  pizza.data.datasets[0].data = [totalConfirmed, totalRecovered, totalDeaths];
  pizza.update();

  bar.data.datasets[0].data = _.map(topten, "TotalDeaths");
  bar.data.labels = _.map(topten, "Country");
  bar.update();

  document.getElementById("date").textContent =
    "Data de atualização: " +
    new Date(Date.parse(date)).toLocaleDateString("pt-BR", {
      timeZone: "America/Recife",
    }) +
    " " +
    new Date(Date.parse(date)).toLocaleTimeString("pt-BR", {
      timeZone: "America/Recife",
    });
}
