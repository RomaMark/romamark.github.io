let rawJWT;
var xpPerMonth = {};
var modXpPerMonth = {};
var xpAmount = new Array();
var auditsDoneArray = new Array();
var auditsRecievedArray = new Array();
var auditsRecievedPerMonth = new Array();
var auditsCompleted;
var projectsCompleted = {};
var projectsCompletedPerMonth = new Array();
var auditsDown = {};
var userId = "";
var data;
var categories2 = [
  "2022 Nov",
  "2022 Dec",
  "2023 Jan",
  "2023 Feb",
  "2023 Mar",
  "2023 Apr",
  "2023 May",
  "2023 Jun",
  "2023 Jul",
  "2023 Aug",
  "2023 Sep",
  "2023 Oct",
  "2023 Nov",
  "2023 Dec",
  "2024 Jan",
];

var categories3 = [
  "2022-11",
  "2022-12",
  "2023-01",
  "2023-02",
  "2023-03",
  "2023-04",
  "2023-05",
  "2023-06",
  "2023-07",
  "2023-08",
  "2023-09",
  "2023-10",
  "2023-11",
  "2023-12",
  "2024-01",
];

let query = `{
  user {
    id
    login
    campus
    attrs
  }
}`;

export async function loginUser(username, password) {
  try {
    const base64Credentials = btoa(`${username}:${password}`);
    const response = await fetch("https://01.kood.tech/api/auth/signin", {
      method: "POST",
      headers: {
        Authorization: `Basic ${base64Credentials}`,
        "Content-Type": "application/json",
      },
    });
    rawJWT = await response.json();
    JWT = rawJWT;
    console.log("This is JWT", rawJWT);
  } catch (error) {
    console.error("error with login", error);
  }
  return rawJWT;
}

export async function display(query) {
  const storedJWT = sessionStorage.getItem("JWT");

  try {
    const response = await fetch(
      "https://01.kood.tech/api/graphql-engine/v1/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedJWT}`,
        },

        body: JSON.stringify({
          query: query,
        }),
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("error with login", error);
    return null;
  }
}

function createProfile(data) {
  const userData = data.data.user[0].attrs;
  const profileContainer = document.createElement("div");
  profileContainer.className = "profile-info";

  const elements = [
    { label: "First Name", value: userData.firstName },
    { label: "Last Name", value: userData.lastName },
    { label: "Email", value: userData.email },
    { label: "Country", value: userData.country },
  ];

  elements.forEach((item) => {
    const elem = document.createElement("p");
    elem.textContent = `${item.label}: ${item.value}`;
    profileContainer.appendChild(elem);
  });

  const chartContainer = document.getElementById("profile-info");
  chartContainer.appendChild(profileContainer);
}

export async function main() {
  data = await display(query);
  createProfile(data);
  userId = data.data.user[0].id;
  var queryXP = `query {
      transaction(
        where: {
          userId: { _eq: ${userId} }
          type: { _eq: "xp"}
          path:{ _nlike: "%piscine%"}
        },
        order_by: { createdAt: desc }
      ) {
        id
        type
        amount
        userId
        attrs
        createdAt
        path
      }
    }`;
  let data2 = await display(queryXP);
  sumUpXP(data2);
  let auditsDone = await queryAudits("up");
  let auditsRecieved = await queryAudits("down");
  auditsCompleted, (auditsDoneArray = sumUpAuditsAmount(auditsDone));
  auditsRecievedPerMonth,
    (auditsRecievedArray = sumUpAuditsAmount(auditsRecieved));
  let sumOfAudits = summary(auditsDoneArray);
  let sumOfAuditsGained = summary(auditsRecievedArray);
  displayScore2(
    "audits-total",
    "",
    " Audits done:",
    sumOfAudits,
    " Audits received:",
    sumOfAuditsGained
  );
}

function displayScore2(
  element,
  textBeforeFirstNumber,
  firstNumber,
  textBetweenNumbers,
  secondNumber,
  textAfterSecondNumber
) {
  const toBeDisplayed = document.getElementById(element);
  toBeDisplayed.innerHTML =
    textBeforeFirstNumber +
    "<span style='color: black;'>" +
    firstNumber +
    "</span>" +
    textBetweenNumbers +
    "<span style='color: black;'>" +
    secondNumber +
    "</span>" +
    textAfterSecondNumber;
  toBeDisplayed.style.color = "#34d399";
}

function summary(data) {
  let sumOfAudits = data.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);

  return sumOfAudits;
}

export function logoutUser() {
  sessionStorage.removeItem("JWT");
  window.location.href = "index.html";
}

function sumUpAuditsAmount(data) {
  auditsDown = {};
  for (var month of categories3) {
    auditsDown[month] = 0;
  }
  var total = 0;
  for (let i = 0; i < data.data.transaction.length; i++) {
    total += data.data.transaction[i].amount;
    var monthYear = new Date(data.data.transaction[i].createdAt)
      .toISOString()
      .substring(0, 7);

    if (auditsDown[monthYear] != 0) {
      auditsDown[monthYear]++;
    }

    auditsDown[monthYear] = auditsDown[monthYear] || 1;
  }
  var auditsPerMonth = pusthToArr(auditsDown);

  return auditsDown, auditsPerMonth;
}

function sumUpXP(data) {
  var totalXp = 0;
  var projectsTotal = 0;
  for (var month of categories3) {
    xpPerMonth[month] = 0;
    modXpPerMonth[month] = 0;
    projectsCompleted[month] = 0;
  }

  for (let i = 0; i < data.data.transaction.length; i++) {
    totalXp += data.data.transaction[i].amount;
    var monthYear = new Date(data.data.transaction[i].createdAt)
      .toISOString()
      .substring(0, 7);
    projectsTotal++;
    if (projectsCompleted[monthYear] != 0) {
      projectsCompleted[monthYear]++;
    }

    projectsCompleted[monthYear] = projectsCompleted[monthYear] || 1;
    xpPerMonth[monthYear] =
      (xpPerMonth[monthYear] || 0) + data.data.transaction[i].amount;
  }

  var total3 = 0;

  for (const monthly in xpPerMonth) {
    total3 += xpPerMonth[monthly];
    modXpPerMonth[monthly] += total3;
  }

  xpAmount = pusthToArr(modXpPerMonth);
  projectsCompletedPerMonth = pusthToArr(projectsCompleted);
  displayScore("total-xp", "Total XP: ", totalXp);
  displayScore("projects-total", "Projects completed: ", projectsTotal);
}
function displayScore(element, text, number) {
  const toBeDisplayed = document.getElementById(element);
  toBeDisplayed.innerHTML =
    text + "<span style='color: #34d399;'>" + number + "</span>";
  toBeDisplayed.style.color = "black";
}

function pusthToArr(data) {
  var newArr = new Array();
  for (var value in data) {
    newArr.push(data[value]);
  }
  return newArr;
}

export async function addChart() {
  renderChart();
  renderProjectCompletionChart();
  renderAuditsChart();
}

export async function queryAudits(type) {
  var queryAudit = `query {
    transaction(
      where: {
        userId: { _eq: 4645 }
        type: { _eq: ${type}}
        path:{ _nlike: "%piscine%"}
      },
      order_by: { createdAt: desc }
    ) {
      id
      type
      amount
      userId
      attrs
      createdAt
      path
    }
  }`;

  data = await display(queryAudit);
  return data;
}

function renderChart() {
  var options = {
    series: [
      {
        name: "XP",
        data: xpAmount,
      },
    ],
    chart: {
      foreColor: "#cccccc",
      height: 350,
      type: "line",
      dropShadow: {
        enabled: true,
        color: "#cccccc",
        top: 18,
        left: 7,
        blur: 10,
        opacity: 0.2,
      },
      toolbar: {
        show: false,
      },
    },
    colors: ["#34d399", "#545454"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "straight",
      width: 3,
      colors: "#008000",
    },
    title: {
      text: "Cumulative XP",
      align: "left",
    },

    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"],
        opacity: 0.5,
      },
    },
    xaxis: {
      categories: categories2,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      floating: true,
      offsetY: -25,
      offsetX: -5,
    },
  };

  var chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();
}

function renderProjectCompletionChart() {
  var options = {
    series: [
      {
        name: "Projects done",
        data: projectsCompletedPerMonth,
      },
    ],
    chart: {
      foreColor: "#cccccc",
      height: 350,
      type: "line",
      dropShadow: {
        enabled: true,
        color: "#cccccc",
        top: 18,
        left: 7,
        blur: 10,
        opacity: 0.2,
      },
      toolbar: {
        show: false,
      },
    },
    colors: ["#34d399", "#545454"],
    dataLabels: {
      enabled: true,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "straight",
      width: 3,
      colors: "#008000",
    },
    title: {
      text: "Project completed per month",
      align: "left",
    },
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"],
        opacity: 0.5,
      },
    },
    xaxis: {
      categories: categories2,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      floating: true,
      offsetY: -25,
      offsetX: -5,
    },
  };

  var chart = new ApexCharts(document.querySelector("#chart2"), options);
  chart.render();
}

function renderAuditsChart() {
  var options = {
    series: [
      {
        name: "Audits done",
        data: auditsDoneArray,
      },
      {
        name: "Audits recieved",
        data: auditsRecievedArray,
      },
    ],
    chart: {
      foreColor: "#cccccc",
      height: 350,
      type: "line",
      dropShadow: {
        enabled: true,
        color: "#cccccc",
        top: 18,
        left: 7,
        blur: 10,
        opacity: 0.2,
      },
      toolbar: {
        show: false,
      },
    },
    colors: ["#34d399", "#545454"],
    dataLabels: {
      enabled: true,
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["#008000", "#545454"],
    },
    title: {
      text: "Audits done and recieved per month!",
      align: "left",
    },
    grid: {
      borderColor: "#e7e7e7",
      row: {
        colors: ["#f3f3f3", "transparent"],
        opacity: 0.5,
      },
    },
    markers: {
      size: 1,
    },
    xaxis: {
      categories: categories2,
    },
    yaxis: {
      title: {
        text: "Audits completed per month",
      },
      min: 5,
      max: 40,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      floating: true,
      offsetY: -25,
      offsetX: -5,
    },
  };

  var chart = new ApexCharts(document.querySelector("#chart3"), options);
  chart.render();
}
