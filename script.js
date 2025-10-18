// script.js - Malaysia Water Management Analysis

// Configuration for all visualizations
const CONFIG = {
    view: { stroke: null },
    axis: { grid: true, gridColor: "#f0f0f0" }
};

// Data URLs
const DATA_URLS = {
    waterConsumption: "https://raw.githubusercontent.com/zanee-y/FIT3179-Dataset-Week10/refs/heads/main/water_consumption_clean.csv",
    waterProduction: "https://raw.githubusercontent.com/zanee-y/FIT3179-Dataset-Week10/refs/heads/main/water_production_clean.csv",
    waterAccess: "https://raw.githubusercontent.com/zanee-y/FIT3179-Dataset-Week10/refs/heads/main/water_access_clean.csv",
    population: "https://raw.githubusercontent.com/zanee-y/FIT3179-Dataset-Week10/refs/heads/main/population_msia_clean.csv",
    statesGeo: "https://raw.githubusercontent.com/zanee-y/FIT3179-Dataset-Week10/main/ne_10m_admin_1_states_provinces.json"
};

// State options for dropdowns
const STATE_OPTIONS = [
    "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", 
    "Pahang", "Perak", "Perlis", "Pulau Pinang", "Sabah", 
    "Sarawak", "Selangor", "Terengganu", "W.P. Labuan"
];

// Year options for dropdowns
const YEAR_OPTIONS = [
    "2012", "2013", "2014", "2015", "2016", 
    "2017", "2018", "2019", "2020", "2021", "2022"
];

// Color schemes
const COLOR_SCHEMES = {
    states: [
        "#E69F00", "#56B4E9", "#006E73", "#F0E442",
        "#0072B2", "#D55E00", "#CC79A7", "#999999",
        "#117733", "#332288", "#FFA500", "#44AA99",
        "#DDCC77", "#AA6699"
    ],
    productionConsumption: {
        domain: ["Production", "Consumption"],
        range: ["#1f77b4", "#ff7f0e"]
    }
};

// Utility functions
const Utils = {
    // Format numbers with commas
    formatNumber: (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    // Extract year from date string (format: DD/MM/YYYY)
    extractYear: (dateString) => {
        return dateString.split('/')[2];
    },

    // Calculate per capita water consumption
    calculatePerCapita: (waterValue, population) => {
        return (waterValue * 1000000) / (population * 1000) / 365;
    }
};

// Choropleth Map Specification
const createChoroplethSpec = () => ({
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    width: 800,
    height: 500,
    padding: { left: 5, right: 200, top: 5, bottom: 5 },
    autosize: "none",
    title: {
        text: "Malaysia Per Capita Water Consumption by State (2012-2022)",
        fontSize: 16,
        anchor: "start"
    },
    signals: [
        {
            name: "year_select",
            value: 2022,
            bind: {
                input: "select",
                options: YEAR_OPTIONS.map(year => parseInt(year)),
                name: "Select Year:"
            }
        },
        {
            name: "sector_select",
            value: "domestic",
            bind: {
                input: "select",
                options: ["domestic", "nondomestic"],
                labels: ["Domestic", "Non-Domestic"],
                name: "Select Sector:"
            }
        }
    ],
    data: [
        {
            name: "water_raw",
            url: DATA_URLS.waterConsumption,
            format: { type: "csv", parse: { date: "date", value: "number" } }
        },
        {
            name: "water_filtered",
            source: "water_raw",
            transform: [
                { type: "formula", expr: "year(datum.date)", as: "year" },
                { type: "filter", expr: "datum.year == year_select && datum.sector == sector_select" }
            ]
        },
        {
            name: "population_raw",
            url: DATA_URLS.population,
            format: { type: "csv", parse: { date: "date", population: "number" } }
        },
        {
            name: "population_filtered",
            source: "population_raw",
            transform: [
                { type: "formula", expr: "year(datum.date)", as: "year" },
                { type: "filter", expr: "datum.year == year_select" }
            ]
        },
        {
            name: "combined_data",
            source: "water_filtered",
            transform: [
                {
                    type: "lookup",
                    from: "population_filtered",
                    key: "state",
                    fields: ["state"],
                    values: ["population"]
                },
                {
                    type: "formula",
                    expr: "(datum.value * 1000000) / (datum.population * 1000) / 365",
                    as: "per_capita"
                }
            ]
        },
        {
            name: "states_geo",
            url: DATA_URLS.statesGeo,
            format: { type: "topojson", feature: "states" }
        },
        {
            name: "states_with_data",
            source: "states_geo",
            transform: [
                {
                    type: "formula",
                    expr: "datum.properties.Name == 'Penang' ? 'Pulau Pinang' : datum.properties.Name == 'Labuan' ? 'W.P. Labuan' : datum.properties.Name",
                    as: "state_name"
                },
                {
                    type: "lookup",
                    from: "combined_data",
                    key: "state",
                    fields: ["state_name"],
                    values: ["value", "population", "per_capita", "year"],
                    as: ["water_value", "population", "per_capita", "year"]
                }
            ]
        },
        {
            name: "graticule",
            transform: [
                { type: "graticule", extent: [[95, -5], [118, 8]], step: [2, 2] }
            ]
        }
    ],
    projections: [
        {
            name: "projection",
            type: "mercator",
            center: [108, 4],
            scale: 2700,
            translate: [400, 250]
        }
    ],
    scales: [
        {
            name: "color",
            type: "linear",
            domain: [0, 1.0],
            range: { scheme: "blues" },
            clamp: true
        }
    ],
    legends: [
        {
            fill: "color",
            type: "gradient",
            title: "Per Capita Consumption",
            orient: "right",
            direction: "vertical",
            gradientLength: 200,
            gradientThickness: 16,
            format: ".1f",
            titleFontSize: 12,
            labelFontSize: 11,
            titleLimit: 300
        }
    ],
    marks: [
        {
            type: "shape",
            from: { data: "graticule" },
            encode: {
                update: {
                    strokeWidth: { value: 0.8 },
                    stroke: { value: "#e6e6e6" },
                    fill: { value: null }
                }
            },
            transform: [{ type: "geoshape", projection: "projection" }]
        },
        {
            type: "shape",
            from: { data: "states_with_data" },
            encode: {
                update: {
                    strokeWidth: { value: 0.5 },
                    stroke: { value: "white" },
                    fill: [
                        { test: "datum.per_capita != null", scale: "color", field: "per_capita" },
                        { value: "#ddd" }
                    ],
                    tooltip: {
                        signal: "{'State': datum.properties.Name, 'Sector': sector_select == 'domestic' ? 'Domestic' : 'Non-Domestic', 'Year': year_select, 'Per Capita (liters/person/day)': format(datum.per_capita, '.1f'), 'Total Consumption (million liters)': format(datum.water_value, ','), 'Population (thousands)': format(datum.population, ',.1f')}"
                    }
                }
            },
            transform: [{ type: "geoshape", projection: "projection" }]
        },
        {
            type: "text",
            encode: {
                enter: {
                    x: { value: 0 },
                    y: { value: 345 },
                    text: { value: "Selangor: Highest consumption" },
                    fontSize: { value: 11 },
                    fontWeight: { value: "bold" },
                    fill: { value: "#333" }
                }
            }
        },
        {
            type: "rule",
            encode: {
                enter: {
                    x: { value: 80 },
                    y: { value: 335 },
                    x2: { value: 100 },
                    y2: { value: 280 },
                    stroke: { value: "#333" },
                    strokeWidth: { value: 1.5 }
                }
            }
        }
    ],
    config: CONFIG
});

// Line Chart Specification
const createLineChartSpec = () => ({
    "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
    width: 800,
    height: 500,
    data: { values: [] },
    transform: [
        {
            lookup: "state",
            from: {
                data: { url: DATA_URLS.waterConsumption, format: { type: "csv" } },
                key: "state",
                fields: ["value", "date", "sector"]
            }
        }
    ],
    params: [
        {
            name: "state_select",
            value: "Selangor",
            bind: {
                input: "select",
                options: STATE_OPTIONS,
                name: "Select State:"
            }
        }
    ],
    layer: [
        {
            // Production line
            data: { url: DATA_URLS.waterProduction, format: { type: "csv" } },
            transform: [
                { type: "formula", expr: "split(datum.date, '/')[2]", as: "year" },
                { type: "filter", expr: "datum.state == state_select" },
                { type: "formula", expr: "datum.value", as: "volume" },
                { type: "formula", expr: "'Production'", as: "type" }
            ],
            mark: {
                type: "line",
                strokeWidth: 3,
                tooltip: true
            },
            encoding: {
                x: { field: "year", type: "ordinal", title: "Year" },
                y: {
                    field: "volume",
                    type: "quantitative",
                    title: "Water Volume (million liters)",
                    scale: { domain: [0, 5500] }
                },
                color: {
                    field: "type",
                    type: "nominal",
                    scale: COLOR_SCHEMES.productionConsumption,
                    legend: { title: "Water Metric" }
                },
                tooltip: [
                    { field: "type", title: "Type" },
                    { field: "volume", title: "Volume", format: "," },
                    { field: "year", title: "Year" }
                ]
            }
        },
        {
            // Consumption line
            data: { url: DATA_URLS.waterConsumption, format: { type: "csv" } },
            transform: [
                { type: "formula", expr: "split(datum.date, '/')[2]", as: "year" },
                { type: "filter", expr: "datum.state == state_select" },
                {
                    type: "aggregate",
                    ops: ["sum"],
                    fields: ["value"],
                    as: ["total_consumption"],
                    groupby: ["state", "year"]
                },
                { type: "formula", expr: "datum.total_consumption", as: "volume" },
                { type: "formula", expr: "'Consumption'", as: "type" }
            ],
            mark: {
                type: "line",
                strokeWidth: 3,
                tooltip: true
            },
            encoding: {
                x: { field: "year", type: "ordinal", title: "Year" },
                y: {
                    field: "volume",
                    type: "quantitative",
                    title: "Water Volume (million liters)",
                    scale: { domain: [0, 5500] }
                },
                color: {
                    field: "type",
                    type: "nominal",
                    scale: COLOR_SCHEMES.productionConsumption,
                    legend: { title: "Water Metric" }
                },
                tooltip: [
                    { field: "type", title: "Type" },
                    { field: "volume", title: "Volume", format: "," },
                    { field: "year", title: "Year" }
                ]
            }
        },
        {
            // Production points
            data: { url: DATA_URLS.waterProduction, format: { type: "csv" } },
            transform: [
                { type: "formula", expr: "split(datum.date, '/')[2]", as: "year" },
                { type: "filter", expr: "datum.state == state_select" },
                { type: "formula", expr: "datum.value", as: "volume" },
                { type: "formula", expr: "'Production'", as: "type" }
            ],
            mark: {
                type: "point",
                size: 60,
                tooltip: true,
                fill: COLOR_SCHEMES.productionConsumption.range[0],
                stroke: "white",
                strokeWidth: 1
            },
            encoding: {
                x: { field: "year", type: "ordinal", title: "Year" },
                y: { field: "volume", type: "quantitative", title: "Water Volume (million liters)" },
                tooltip: [
                    { field: "type", title: "Type" },
                    { field: "volume", title: "Volume", format: "," },
                    { field: "year", title: "Year" }
                ]
            }
        },
        {
            // Consumption points
            data: { url: DATA_URLS.waterConsumption, format: { type: "csv" } },
            transform: [
                { type: "formula", expr: "split(datum.date, '/')[2]", as: "year" },
                { type: "filter", expr: "datum.state == state_select" },
                {
                    type: "aggregate",
                    ops: ["sum"],
                    fields: ["value"],
                    as: ["total_consumption"],
                    groupby: ["state", "year"]
                },
                { type: "formula", expr: "datum.total_consumption", as: "volume" },
                { type: "formula", expr: "'Consumption'", as: "type" }
            ],
            mark: {
                type: "point",
                size: 60,
                tooltip: true,
                fill: COLOR_SCHEMES.productionConsumption.range[1],
                stroke: "white",
                strokeWidth: 1
            },
            encoding: {
                x: { field: "year", type: "ordinal", title: "Year" },
                y: { field: "volume", type: "quantitative", title: "Water Volume (million liters)" },
                tooltip: [
                    { field: "type", title: "Type" },
                    { field: "volume", title: "Volume", format: "," },
                    { field: "year", title: "Year" }
                ]
            }
        },
        {
            // Production labels (highest/lowest)
            data: { url: DATA_URLS.waterProduction, format: { type: "csv" } },
            transform: [
                { type: "formula", expr: "split(datum.date, '/')[2]", as: "year" },
                { type: "filter", expr: "datum.state == state_select" },
                { type: "window", ops: ["rank"], as: ["rank"], sort: [{ field: "value", order: "descending" }] },
                { type: "filter", expr: "datum.rank == 1 || datum.rank == length(data('water_production'))" },
                {
                    type: "formula",
                    expr: "datum.rank == 1 ? 'Highest Production: ' + format(datum.value, ',.0f') : 'Lowest Production: ' + format(datum.value, ',.0f')",
                    as: "prod_label"
                }
            ],
            mark: {
                type: "text",
                align: "left",
                baseline: "middle",
                dx: -50,
                dy: 15,
                fontSize: 10,
                fontWeight: "bold",
                color: "#000000"
            },
            encoding: {
                x: { field: "year", type: "ordinal" },
                y: { field: "value", type: "quantitative" },
                text: { field: "prod_label", type: "nominal" }
            }
        },
        {
            // Consumption labels (highest/lowest)
            data: { url: DATA_URLS.waterConsumption, format: { type: "csv" } },
            transform: [
                { type: "formula", expr: "split(datum.date, '/')[2]", as: "year" },
                { type: "filter", expr: "datum.state == state_select" },
                {
                    type: "aggregate",
                    ops: ["sum"],
                    fields: ["value"],
                    as: ["total_consumption"],
                    groupby: ["state", "year"]
                },
                { type: "window", ops: ["rank"], as: ["rank"], sort: [{ field: "total_consumption", order: "descending" }] },
                { type: "filter", expr: "datum.rank == 1 || datum.rank == length(data('water_consumption'))" },
                {
                    type: "formula",
                    expr: "datum.rank == 1 ? 'Highest Consumption: ' + format(datum.total_consumption, ',.0f') : 'Lowest Consumption: ' + format(datum.total_consumption, ',.0f')",
                    as: "cons_label"
                }
            ],
            mark: {
                type: "text",
                align: "left",
                baseline: "middle",
                dx: -60,
                dy: -11,
                fontSize: 10,
                fontWeight: "bold",
                color: "#000000"
            },
            encoding: {
                x: { field: "year", type: "ordinal" },
                y: { field: "total_consumption", type: "quantitative" },
                text: { field: "cons_label", type: "nominal" }
            }
        }
    ],
    config: CONFIG
});

// Radial Chart Specification
const createRadialSpec = () => ({
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    width: 400,
    height: 400,
    data: { url: DATA_URLS.waterProduction, format: { type: "csv" } },
    params: [
        {
            name: "year_select",
            value: "2022",
            bind: {
                input: "select",
                options: YEAR_OPTIONS,
                name: "Select Year:"
            }
        }
    ],
    transform: [
        { type: "formula", expr: "split(datum.date, '/')[2]", as: "year" },
        { type: "filter", expr: "datum.year == year_select" },
        { type: "formula", expr: "toNumber(datum.value)", as: "value_num" },
        {
            type: "window",
            ops: ["rank"],
            as: ["rank"],
            sort: [{ field: "value_num", order: "descending" }],
            groupby: ["year"]
        }
    ],
    layer: [
        {
            mark: {
                type: "arc",
                innerRadius: 50,
                outerRadius: 250,
                stroke: "white",
                strokeWidth: 1,
                tooltip: true
            },
            encoding: {
                theta: {
                    field: "rank",
                    type: "ordinal",
                    sort: "ascending",
                    axis: null
                },
                radius: {
                    field: "value_num",
                    type: "quantitative",
                    scale: { type: "linear", rangeMin: 50, rangeMax: 250 }
                },
                color: {
                    field: "state",
                    type: "nominal",
                    title: "State",
                    scale: { range: COLOR_SCHEMES.states },
                    legend: {
                        orient: "right",
                        title: "States",
                        columns: 2,
                        labelLimit: 100
                    }
                },
                tooltip: [
                    { field: "rank", type: "quantitative", title: "Rank" },
                    { field: "state", type: "nominal", title: "State" },
                    { field: "value_num", type: "quantitative", title: "Production", format: "," },
                    { field: "year", type: "ordinal", title: "Year" }
                ]
            }
        },
        {
            // Top 3 labels
            transform: [
                { type: "filter", expr: "datum.rank <= 3" },
                {
                    type: "formula",
                    expr: "datum.rank + '. ' + datum.state + ' (' + format(datum.value_num, ',') + ')'",
                    as: "label"
                }
            ],
            mark: {
                type: "text",
                align: "center",
                baseline: "middle",
                fontSize: 9,
                fontWeight: "bold",
                color: "black"
            },
            encoding: {
                theta: { field: "rank", type: "ordinal", sort: "ascending" },
                radius: {
                    field: "value_num",
                    type: "quantitative",
                    scale: { type: "linear", rangeMin: 50, rangeMax: 250 }
                },
                text: { field: "label", type: "nominal" }
            }
        }
    ],
    config: {
        view: { stroke: null },
        axis: { grid: false, labels: false, ticks: false }
    }
});

// Bar Chart Specification
const createBarChartSpec = () => ({
    "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
    width: 800,
    height: 500,
    data: { url: DATA_URLS.waterAccess, format: { type: "csv" } },
    transform: [
        { type: "formula", expr: "split(datum.date, '/')[2]", as: "year" },
        { type: "filter", expr: "datum.year == year_select" },
        { type: "pivot", field: "strata", value: "proportion", groupby: ["state", "year"] },
        { type: "formula", expr: "datum.urban - datum.rural", as: "access_difference" }
    ],
    params: [
        {
            name: "year_select",
            value: "2022",
            bind: {
                input: "select",
                options: YEAR_OPTIONS,
                name: "Select Year:"
            }
        }
    ],
    layer: [
        {
            mark: "bar",
            encoding: {
                x: {
                    field: "access_difference",
                    type: "quantitative",
                    title: "Urban-Rural Access Difference (%)"
                },
                y: {
                    field: "state",
                    type: "nominal",
                    title: "State",
                    sort: { field: "access_difference", order: "descending" }
                },
                color: { value: "#1f77b4" },
                tooltip: [
                    { field: "state", title: "State" },
                    { field: "rural", title: "Rural Access", format: ".1f" },
                    { field: "urban", title: "Urban Access", format: ".1f" },
                    { field: "access_difference", title: "Access Difference", format: ".1f" },
                    { field: "year", title: "Year" }
                ]
            }
        },
        {
            // Annotations
            data: {
                values: [
                    {
                        annotation: "Negative values show that rural areas receive more access to water than urban areas",
                        x: 1,
                        y: 1
                    },
                    {
                        annotation: "Positive values show that urban areas receive more access to water than rural areas",
                        x: 4,
                        y: 10
                    },
                    {
                        annotation: "The zero value shows that there are no differences in water access between rural and urban areas",
                        x: 1,
                        y: 2.5
                    }
                ]
            },
            mark: {
                type: "text",
                align: "left",
                fontSize: 11,
                fontWeight: "normal",
                color: "#666666",
                dx: 5
            },
            encoding: {
                x: { field: "x", type: "quantitative", title: "Urban-Rural Access Difference (%)" },
                y: { field: "y", type: "quantitative", axis: null, scale: { domain: [0.5, 14.5] } },
                text: { field: "annotation", type: "nominal" }
            }
        }
    ]
});

// Main initialization function
const initializeVisualizations = () => {
    try {
        // Embed all visualizations
        vegaEmbed('#choropleth', createChoroplethSpec())
            .then(result => console.log('Choropleth map loaded successfully'))
            .catch(error => console.error('Error loading choropleth:', error));

        vegaEmbed('#line-chart', createLineChartSpec())
            .then(result => console.log('Line chart loaded successfully'))
            .catch(error => console.error('Error loading line chart:', error));

        vegaEmbed('#radial-chart', createRadialSpec())
            .then(result => console.log('Radial chart loaded successfully'))
            .catch(error => console.error('Error loading radial chart:', error));

        vegaEmbed('#bar-chart', createBarChartSpec())
            .then(result => console.log('Bar chart loaded successfully'))
            .catch(error => console.error('Error loading bar chart:', error));

        console.log('All visualizations initialized successfully');
    } catch (error) {
        console.error('Error initializing visualizations:', error);
    }
};

// Export for use in HTML
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        DATA_URLS,
        STATE_OPTIONS,
        YEAR_OPTIONS,
        COLOR_SCHEMES,
        Utils,
        createChoroplethSpec,
        createLineChartSpec,
        createRadialSpec,
        createBarChartSpec,
        initializeVisualizations
    };
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeVisualizations);
} else {
    initializeVisualizations();
}
