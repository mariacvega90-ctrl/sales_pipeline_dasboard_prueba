let deals = [];
let owners = [];

let revenueChart;

const valueLabelPlugin = {
    id: 'valueLabelPlugin',

    afterDatasetsDraw(chart) {

        const { ctx, chartArea } = chart;

        const isHorizontal =
            chart.options.indexAxis === 'y';

        chart.data.datasets.forEach((dataset, i) => {

            const meta = chart.getDatasetMeta(i);

            meta.data.forEach((bar, index) => {

                const value = dataset.data[index];

                if (value == null) return;

                ctx.save();

                ctx.fillStyle = "#111827";
                ctx.font = "bold 12px Arial";
                ctx.textBaseline = "middle";

                if (isHorizontal) {

                    //barras horizontales
                    ctx.textAlign = "left";

                    ctx.fillText(
                        Math.round(value).toLocaleString(),
                        bar.x + 8,
                        bar.y
                    );

                } else {

                    //barras verticales
                    ctx.textAlign = "center";

                    ctx.fillText(
                        Math.round(value).toLocaleString(),
                        bar.x,
                        bar.y - 8
                    );
                }

                ctx.restore();
            });
        });
    }
};
// ==========================================
// LEER DEALS CSV
// ==========================================

Papa.parse("Deals.csv", {

    download: true,

    header: true,

    skipEmptyLines: true,

    complete: function(results) {

        deals = results.data;

        console.log("Deals cargados");
        console.log(deals);

        checkDataLoaded();

    }

});

// ==========================================
// LEER OWNERS CSV
// ==========================================

Papa.parse("Owners.csv", {

    download: true,

    header: true,

    skipEmptyLines: true,

    complete: function(results) {

        owners = results.data;

        console.log("Owners cargados");
        console.log(owners);

        checkDataLoaded();

    }

});

// ==========================================
// VERIFICAR QUE TODO CARGÓ
// ==========================================

function checkDataLoaded() {

    if (
        deals.length > 0
        &&
        owners.length > 0
    ) {

        initializeDashboard();

    }

}

// ==========================================
// INICIALIZAR DASHBOARD
// ==========================================

function initializeDashboard() {

    populateFilters();

    updateDashboard();

    // EVENTOS FILTROS
    document
        .getElementById("regionFilter")
        .addEventListener("change", updateDashboard);

    document
        .getElementById("stageFilter")
        .addEventListener("change", updateDashboard);

    document
        .getElementById("ownerFilter")
        .addEventListener("change", updateDashboard);
    document
    .getElementById("productLineFilter")
    .addEventListener("change", updateDashboard);

document
    .getElementById("industryFilter")
    .addEventListener("change", updateDashboard);

}

// ==========================================
// LLENAR FILTROS
// ==========================================

function populateFilters() {

    // REGIONES
    const regions = [

        ...new Set(
            deals.map(d => d.region)
        )

    ];

    const regionFilter =
        document.getElementById("regionFilter");

    regions.forEach(region => {

        let option =
            document.createElement("option");

        option.value = region;

        option.textContent = region;

        regionFilter.appendChild(option);

    });

    // STAGES
    const stages = [

        ...new Set(
            deals.map(d => d.stage)
        )

    ];

    const stageFilter =
        document.getElementById("stageFilter");

    stages.forEach(stage => {

        let option =
            document.createElement("option");

        option.value = stage;

        option.textContent = stage;

        stageFilter.appendChild(option);

    });
    // INDUSTRIES
const industries = [

    ...new Set(
        deals.map(d => d.industry)
    )

];

const industryFilter =
    document.getElementById(
        "industryFilter"
    );

industries.forEach(industry => {

    let option =
        document.createElement("option");

    option.value = industry;

    option.textContent = industry;

    industryFilter.appendChild(option);

});
// PRODUCT LINES
const productLines = [

    ...new Set(
        deals.map(d => d.product_line)
    )

];

const productLineFilter =
    document.getElementById(
        "productLineFilter"
    );

productLines.forEach(product => {

    let option =
        document.createElement("option");

    option.value = product;

    option.textContent = product;

    productLineFilter.appendChild(option);

});

    // OWNERS
    const owners = [

        ...new Set(
            deals.map(d => d.owner)
        )

    ];

    const ownerFilter =
        document.getElementById("ownerFilter");

    owners.forEach(owner => {

        let option =
            document.createElement("option");

        option.value = owner;

        option.textContent = owner;

        ownerFilter.appendChild(option);

    });

}

// ==========================================
// OBTENER DATOS FILTRADOS
// ==========================================

function getFilteredDeals() {

const selectedProductLine =
    document.getElementById(
        "productLineFilter"
    ).value;

const selectedIndustry =
    document.getElementById(
        "industryFilter"
    ).value;

    const selectedRegion =
        document.getElementById("regionFilter").value;

    const selectedStage =
        document.getElementById("stageFilter").value;

    const selectedOwner =
        document.getElementById("ownerFilter").value;

    return deals.filter(deal => {

        return (

            (selectedRegion === "" ||
                deal.region === selectedRegion)

            &&

            (selectedStage === "" ||
                deal.stage === selectedStage)

            &&

            (selectedOwner === "" ||
                deal.owner === selectedOwner)
            &&

(selectedProductLine === "" ||
    deal.product_line === selectedProductLine)

&&

(selectedIndustry === "" ||
    deal.industry === selectedIndustry)

        );

    });

}

// ==========================================
// ACTUALIZAR TODO
// ==========================================

function updateDashboard() {

    const filteredDeals =
        getFilteredDeals();

    calculateKPIs(filteredDeals);

    renderRevenueOverviewChart(filteredDeals);

    renderStageChart(filteredDeals);

    renderTable(filteredDeals);

    renderHeatmap(filteredDeals);
    
    renderAlerts(filteredDeals);
    
    renderConversionCards(filteredDeals);

}
// ==========================================
// ALERTAS AUTOMÁTICAS
// ==========================================

// FUNNEL CONVERSION CARDS
// ==========================================

function renderConversionCards(data) {

    // ===============================
    // CONTAR DEALS POR STAGE
    // ===============================

    const discovery =
        data.filter(d =>
            (d.stage || "").trim() === "Discovery"
        ).length;

    const qualification =
        data.filter(d =>
            (d.stage || "").trim() === "Qualification"
        ).length;

    const proposal =
        data.filter(d =>
            (d.stage || "").trim() === "Proposal"
        ).length;

    const negotiation =
        data.filter(d =>
            (d.stage || "").trim() === "Negotiation"
        ).length;

    const won =
        data.filter(d =>
            (d.stage || "").trim() === "Closed Won"
        ).length;

    // ===============================
    // CALCULAR CONVERSIONES
    // ===============================

    const discoveryQualification =
        discovery > 0
        ? (qualification / discovery) * 100
        : 0;

    const qualificationProposal =
        qualification > 0
        ? (proposal / qualification) * 100
        : 0;

    const proposalNegotiation =
        proposal > 0
        ? (negotiation / proposal) * 100
        : 0;

    const negotiationWon =
        negotiation > 0
        ? (won / negotiation) * 100
        : 0;

    // ===============================
    // ACTUALIZAR HTML
    // ===============================

    document.getElementById(
        "pipelineQualified"
    ).textContent =
        discoveryQualification.toFixed(1) + "%";

    document.getElementById(
        "qualifiedProposal"
    ).textContent =
        qualificationProposal.toFixed(1) + "%";

    document.getElementById(
        "proposalNegotiation"
    ).textContent =
        proposalNegotiation.toFixed(1) + "%";

    document.getElementById(
        "negotiationWon"
    ).textContent =
        negotiationWon.toFixed(1) + "%";

}
function renderAlerts(data) {
    

   // ----------------------------------
    // TOP OWNERS
    // ----------------------------------

    const ownerRevenue = {};

    data.forEach(deal => {

        const owner =
            (deal.owner || "Unassigned").trim();

        const amount = parseFloat(
            String(deal.invoice_amount_usd || "0")
                .replace(/,/g, "")
                .replace(/\$/g, "")
        ) || 0;

        if (!ownerRevenue[owner]) {
            ownerRevenue[owner] = 0;
        }

        ownerRevenue[owner] += amount;

    });

    // ----------------------------------
    // RANKING OWNERS
    // ----------------------------------

    const topOwners = Object.entries(ownerRevenue)

        .sort((a, b) => b[1] - a[1])

        .slice(0, 3);

    // ----------------------------------
    // HTML OWNERS
    // ----------------------------------

    let ownersHTML = "";

    topOwners.forEach((owner, index) => {

        const medal =
            index === 0 ? "🥇" :
            index === 1 ? "🥈" :
            "🥉";

        ownersHTML += `
            <div>
                ${medal}
                <b>${owner[0]}</b>
                &nbsp;
                $${Math.round(owner[1]).toLocaleString()}
            </div>
        `;

    });

    document.getElementById("topOwners").innerHTML =
        ownersHTML;

    // ----------------------------------
    // CLOSED WON DEALS
    // ----------------------------------

    const closedWonDeals = data.filter(deal => {

        return (
            (deal.stage || "").trim() === "Closed Won"
            &&
            deal.deal_created_date
            &&
            deal.close_date
        );

    });

    // ----------------------------------
    // PROMEDIO TIEMPO CIERRE
    // ----------------------------------

    const avgCloseDays =

    closedWonDeals.length > 0

    ? closedWonDeals.reduce((sum, deal) => {

        // =====================================
        // LIMPIAR FECHAS
        // =====================================

        const created =
            String(deal.deal_created_date || "").trim();

        const invoice =
            String(deal.close_date || "").trim();

        // =====================================
        // CONVERTIR FECHAS
        // =====================================

        const createdParts =
            created.split("/");

        const invoiceParts =
            invoice.split("/");

        // =====================================
        // VALIDAR
        // =====================================

        if (
            createdParts.length !== 3
            ||
            invoiceParts.length !== 3
        ) {
            return sum;
        }

        // =====================================
        // CREAR FECHAS
        // =====================================

        const createdDate = new Date(
            createdParts[2], // año
            createdParts[1] - 1, // mes
            createdParts[0] // día
        );

        const invoiceDate = new Date(
            invoiceParts[2],
            invoiceParts[1] - 1,
            invoiceParts[0]
        );

        // =====================================
        // DIFERENCIA
        // =====================================

        const diffDays =
            (invoiceDate - createdDate)
            / (1000 * 60 * 60 * 24);

        // =====================================
        // VALIDAR NAN
        // =====================================

        if (isNaN(diffDays)) {
            return sum;
        }

        return sum + diffDays;

    }, 0) / closedWonDeals.length

    : 0;

    // ----------------------------------
    // DEALS EN RIESGO
    // ----------------------------------

    const riskyDeals = data.filter(deal =>
        Number(deal.last_activity_days_ago) > 45
    );

    // ----------------------------------
    // DINERO EN RIESGO
    // ----------------------------------

    const riskyRevenue = riskyDeals.reduce((sum, deal) => {

        const amount = parseFloat(
            String(deal.amount_usd || "0")
                .replace(/,/g, "")
                .replace(/\$/g, "")
        ) || 0;

        return sum + amount;

    }, 0);

    // ----------------------------------
    // DEALS SIN OWNER
    // ----------------------------------

    const orphanDeals = data.filter(deal =>
        !deal.owner || deal.owner.trim() === "Unassigned"
    );

    // ----------------------------------
    // CLOSED WON SIN FACTURA
    // ----------------------------------

    const missingInvoices = data.filter(deal => {

        const stage =
            (deal.stage || "").trim();

        const payment_status =
            (deal.payment_status || "")
                .trim()
                .toLowerCase();

        return (
            stage === "Closed Won"
            &&
            payment_status === "sin_factura"
        );

    });

    // ----------------------------------
    // REGIÓN MÁS FUERTE
    // ----------------------------------

    const regions = {};

    data.forEach(deal => {

        const region =
            (deal.region || "Unknown")
                .trim();

        const amount = parseFloat(
            String(deal.invoice_amount_usd || "0")
                .replace(/,/g, "")
                .replace(/\$/g, "")
                .trim()
        ) || 0;

        if (!regions[region]) {
            regions[region] = 0;
        }

        regions[region] += amount;

    });

    // ----------------------------------
    // TOP REGIÓN
    // ----------------------------------

    let bestRegion = "";
    let maxRevenue = 0;

    for (const region in regions) {

        if (regions[region] > maxRevenue) {

            maxRevenue = regions[region];
            bestRegion = region;

        }

    }

    // ----------------------------------
    // ACTUALIZAR HTML
    // ----------------------------------

    document.getElementById("alertRisk").innerHTML =
        `⚠️ &nbsp;<b>${riskyDeals.length}</b>&nbsp;&nbsp;deals llevan más de 60 días sin actividad`;

    document.getElementById("alertOwners").innerHTML =
        `⚠️ &nbsp;<b>${orphanDeals.length}</b>&nbsp;&nbsp;deals no tienen owner asignado`;

    document.getElementById("alertInvoices").innerHTML =
        `⚠️ &nbsp;<b>${missingInvoices.length}</b>&nbsp;&nbsp;Closed Won no tienen invoice`;

    document.getElementById("topRegion").innerHTML =
        `🟢 &nbsp;<b>${bestRegion}</b>&nbsp;&nbsp;lidera revenue facturado`;

    document.getElementById("avgCloseTime").innerHTML =
        `⏱️ &nbsp;<b>${Math.round(avgCloseDays)}</b>&nbsp;&nbsp;días promedio para cerrar`;

    document.getElementById("riskMoney").innerHTML =
        `💰 &nbsp;<b>$${Math.round(riskyRevenue).toLocaleString()}</b>&nbsp;&nbsp;en deals riesgosos (> 45 dias sin actividad)`;

}
// ==========================================
// KPIs
// ==========================================

function calculateKPIs(data) {

    // ==========================================
    // VALOR PIPELINE ACTIVO
    // ==========================================

    const activeRevenue =
        data
        .filter(deal => {

            return (
                deal.stage !== "Closed Won"
                &&
                deal.stage !== "Closed Lost"
            );

        })
        .reduce((sum, deal) => {

            const amount = parseFloat(
                (deal.amount_usd || "0")
                    .replace(/,/g, "")
            );

            return sum + (
                isNaN(amount)
                ? 0
                : amount
            );

        }, 0);
        const avgDealSize =
    data.length > 0
        ? data.reduce((sum, deal) => {

            const amount = parseFloat(
                (deal.amount_usd || "0")
                    .replace(/,/g, "")
            );

            return sum + (isNaN(amount) ? 0 : amount);

        }, 0) / data.length
        : 0;

    // ==========================================
    // TOTAL DEALS ACTIVOS
    // ==========================================

    const activeLeads =
        data
        .filter(deal => {

            return (
                deal.stage !== "Closed Won"
                &&
                deal.stage !== "Closed Lost"
            );

        }).length;

    // ==========================================
    // DINERO EN RIESGO
    // ==========================================

    const riskRevenue =
        data
        .filter(deal => {

            return (
                Number(deal.last_activity_days_ago) > 60
            );

        })
        .reduce((sum, deal) => {

            const amount = parseFloat(
                (deal.amount_usd || "0")
                    .replace(/,/g, "")
            );

            return sum + (
                isNaN(amount)
                ? 0
                : amount
            );

        }, 0);

    // ==========================================
    // WIN RATE PROMEDIO
    // ==========================================

    const totalWinRate =
        owners.reduce((sum, owner) => {

            const rate = parseFloat(
                (owner.win_rate_percent || "0")
                    .replace("%", "")
            );

            return sum + (
                isNaN(rate)
                ? 0
                : rate
            );

        }, 0);

    const avgWinRate =
        owners.length > 0
        ? totalWinRate / owners.length
        : 0;

    // ==========================================
    // INVOICE AMOUNT
    // ==========================================

    const invoiceAmount =
        data
        .filter(deal => {

            const status =
                (deal.payment_status || "")
                ;

            return status === "Paid";

        })
        .reduce((sum, deal) => {

            const amount = parseFloat(
                (deal.invoice_amount_usd || "0")
                    .replace(/\$/g, "")
                    .replace(",", ".")
            );

            return sum + (
                isNaN(amount)
                ? 0
                : amount
            );

        }, 0);

    // ==========================================
    // ACTUALIZAR HTML
    // ==========================================

    document.getElementById("avgDealSize").textContent =
"$" + Math.round(avgDealSize).toLocaleString();
        

    document
        .getElementById("activeLeads")
        .textContent =
        activeLeads;

    const riskEl = document.getElementById("riskRevenue");

if (riskEl) {
    riskEl.textContent = "$" + riskRevenue.toLocaleString();
}

    document
        .getElementById("avgWinRate")
        .textContent =
        avgWinRate.toFixed(1) + "%";

    document
        .getElementById("invoiceAmount")
        .textContent =
        "$" + Math.round(invoiceAmount).toLocaleString();

}
  

// ==========================================
// GRÁFICA REVENUE
// ==========================================

let revenueOverviewChart;

function renderRevenueOverviewChart(data) {

    const ctx = document.getElementById("revenueOverviewChart");
    if (!ctx) return;

    const parseNumber = (value) => {
        return parseFloat(
            (value || "0")
                .toString()
                .replace(/\./g, "")
                .replace(",", ".")
                .replace("$", "")
        ) || 0;
    };

    const pipeline = data
        .filter(d => d.stage !== "Closed Won" && d.stage !== "Closed Lost")
        .reduce((s, d) => s + parseNumber(d.amount_usd), 0);

    const won = data
        .filter(d => d.stage === "Closed Won")
        .reduce((s, d) => s + parseNumber(d.amount_usd), 0);

    const invoiced = data
        .filter(d => (d.payment_status || "").toLowerCase().trim() === "paid")
        .reduce((s, d) => s + parseNumber(d.invoice_amount_usd), 0);

    if (revenueOverviewChart) {
        revenueOverviewChart.destroy();
    }

    revenueOverviewChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Pipeline", "Won", "Invoiced Paid"],
            datasets: [{
                data: [pipeline, won, invoiced],
                backgroundColor: ["#2563eb", "#22c55e", "#0f766e"],
                borderRadius: 12
            }]
        },
        options: {
            responsive: true,

            plugins: {
                legend: { display: false },
                tooltip: {
  callbacks: {
    label: (ctx) => {
      return "$" + ctx.raw.toLocaleString();
    }
  }
},

                tooltip: {
                    callbacks: {
                        label: (context) =>
                            "$" + context.raw.toLocaleString(),
                        layout : { 
                            padding: {
                                top:25
                            }
                        }
                    }
                }
            },

            scales: {
                x: { 
    grid: { display: false },
    ticks: { 
        display: true,
        color: "#374151",
        font: {
            size: 13,
            weight: "600"
        }
    }
},
                y: {
                    grid: { display: false },   //  sin líneas fondo
                    ticks: { display: false }   //  sin eje Y
                }
            }
        },

        plugins: [valueLabelPlugin]
    });
}

// ==========================================
// STAGE CHART
// ==========================================
let stageChart;

function renderStageChart(data) {

    // ==========================================
    // 1. CONTAR DEALS POR STAGE
    // ==========================================
    const stages = {};

    data.forEach(deal => {

        const stage = deal.stage;

        if (!stage) return;

        if (!stages[stage]) {
            stages[stage] = 0;
        }

        stages[stage]++;
    });

    // ==========================================
    // 2. ORDEN DEL FUNNEL (IMPORTANTE)
    // ==========================================
    const order = [
        "Pipeline",
        "Qualified",
        "Proposal",
        "Negotiation",
        "Closed Won",
        "Closed Lost"
    ];

    const labels = order.filter(stage => stages[stage]);
    const values = labels.map(stage => stages[stage]);

    // ==========================================
    // 3. DESTRUIR GRÁFICO ANTERIOR
    // ==========================================
    if (stageChart) {
        stageChart.destroy();
    }

    // ==========================================
    // 4. CREAR GRÁFICO
    // ==========================================
    const ctx = document.getElementById("stageChart");

  stageChart = new Chart(ctx, {

    type: "bar",

    data: {
        labels: labels,
        datasets: [{
            label: "Deals",
            data: values,
            backgroundColor: [
                "#1e3a8a",
                "#2563eb",
                "#06b6d4",
                "#14b8a6",
                "#22c55e",
                "#ef4444"
            ],
            borderRadius: 10
        }]
    },

    options: {
        indexAxis: "y",

        responsive: true,
        maintainAspectRatio: false,
        animation: false,

        plugins: {
            legend: {
                display: false
            },

            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.label + ": " + context.raw + " deals";
                    }
                }
            }
        },

        scales: {
            x: {
                grid: { display: false },
                ticks: { display: false }
            },
            y: {
                grid: { display: false },
                ticks: { color: "#6b7280" }
            }
        }
    },

    // PLUGIN
    plugins: [valueLabelPlugin]
});
}

// ==========================================
// ==========================================
function renderTable(data) {

    const tbody = document.querySelector("#dealsTable tbody");

    tbody.innerHTML = "";

    data.forEach(deal => {

        // =============================
        // 1. Días sin actividad
        // =============================
        const days = Number(deal.last_activity_days_ago || 0);

        // =============================
        // 2. Riesgo
        // =============================
        let risk = "Low";

        if (days > 60) risk = "High";
        else if (days > 30) risk = "Medium";

        // =============================
        // 3. STATUS FACTURACIÓN (CORREGIDO)
        // =============================
        let payment = (deal.payment_status || "")
            .toString()
            .trim()
            .toLowerCase();

        let invoiceStatus = "Sin_Factura";

        if (payment === "Paid") {
            invoiceStatus = "Paid";
        } 
        else if (payment === "Pending") {
            invoiceStatus = "Pending";
        } 
        else if (payment === "Partial") {
            invoiceStatus = "Partial";
        }
        else if (payment === "Sin_Factura" || payment === "") {
            invoiceStatus = "Sin Factura";
        }

        // =============================
        // 4. HTML
        // =============================
        const row = `
            <tr>
                <td>${deal.deal_name || ""}</td>
                <td>${deal.stage || ""}</td>
                <td>${deal.owner || "Unassigned"}</td>
                <td>$${Number(deal.amount_usd || 0).toLocaleString()}</td>
                <td>${days}</td>
                <td>
    <span class="risk-badge ${risk.toLowerCase()}">

        ${
            risk === "High"
            ? "🔴 High"

            : risk === "Medium"
            ? "🟡 Medium"

            : "🟢 Low"
        }

    </span>
</td>

<td>
    <span class="invoice-badge ${invoiceStatus.toLowerCase()}">

        ${
            invoiceStatus === "Paid"
            ? "🟢 Paid"

            : invoiceStatus === "Pending"
            ? "🟡 Pending"

            : invoiceStatus === "Partial"
            ? "🟠 Partial"

            : "🔴 Sin Factura"
        }

    </span>
</td>
            </tr>
        `;

        tbody.innerHTML += row;
    });
}
// ==========================================
//// HEATMAP DE RIESGO
// ==========================================

function renderHeatmap(data) {

    const matrix = calculateHeatmap(data);

    const container = document.getElementById("riskHeatmap");

    let html = `
        <table class="heatmap-table">
            <tr>
                <th>Stage</th>
                <th>0–30</th>
                <th>30–60</th>
                <th>60+</th>
            </tr>
    `;

    for (let stage in matrix) {

        html += `<tr><td><b>${stage}</b></td>` ;

        for (let bucket in matrix[stage]) {

            const value = matrix[stage][bucket];

            html += `
                <td style="background:${getColor(bucket)}; color:white; padding:10px;">
                    $${Math.round(value).toLocaleString()}
                </td>
            `;
        }

        html += "</tr>";
    }

    html +=' </table>' ;

    container.innerHTML = html;
}
function getColor(bucket) {

    if (bucket === "0-30") return "#22c55e";
    if (bucket === "30-60") return "#f59e0b";
    return "#ef4444";
}
function calculateHeatmap(data) {

    const matrix = {};

    data.forEach(deal => {

        const stage = deal.stage;
        const days = Number(deal.last_activity_days_ago || 0);
        const amount = Number(deal.amount_usd || 0);

        if (!stage) return;

        if (!matrix[stage]) {
            matrix[stage] = {
                "0-30": 0,
                "30-60": 0,
                "60+": 0
            };
        }

        if (days <= 30) {
            matrix[stage]["0-30"] += amount;
        }
        else if (days <= 60) {
            matrix[stage]["30-60"] += amount;
        }
        else {
            matrix[stage]["60+"] += amount;
        }
    });

    return matrix;
}