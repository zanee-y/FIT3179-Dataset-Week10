// script.js - Malaysia Water Management Analysis Visualizations

// Choropleth Map Specification
var vg_choroplethSpec = {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "width": 800,
  "height": 500,
  "padding": {"left": 5, "right": 200, "top": 5, "bottom": 5},
  "autosize": "none",
  "title": {
    "text": "Malaysia Per Capita Water Consumption by State (2012-2022)",
    "fontSize": 16,
    "anchor": "start"
  },
  
  "signals": [
    {
      "name": "year_select",
      "value": 2022,
      "bind": {
        "input": "select",
        "options": [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
        "name": "Select Year: "
      }
    },
    {
      "name": "sector_select",
      "value": "domestic",
      "bind": {
        "input": "select",
        "options": ["domestic", "nondomestic"],
        "labels": ["Domestic", "Non-Domestic"],
        "name": "Select Sector: "
      }
    }
  ],
  
  "data": [
    {
      "name": "water_raw",
      "url": "https://raw.githubusercontent.com/zanee-y/FIT3179-Dataset-Week10/refs/heads/main/water_consumption_clean.csv",
      "format": {"type": "csv", "parse": {"date": "date", "value": "number"}}
    },
    {
      "name": "water_filtered",
      "source": "water_raw",
      "transform": [
        {"type": "formula", "expr": "year(datum.date)", "as": "year"},
        {"type": "filter", "expr": "datum.year == year_select && datum.sector == sector_select"}
      ]
    },
    {
      "name": "population_raw",
      "url": "https://raw.githubusercontent.com/zanee-y/FIT3179-Dataset-Week10/refs/heads/main/population_msia_clean.csv",
      "format": {"type": "csv", "parse": {"date": "date", "population": "number"}}
    },
    {
      "name": "population_filtered",
      "source": "population_raw",
      "transform": [
        {"type": "formula", "expr": "year(datum.date)", "as": "year"},
        {"type": "filter", "expr": "datum.year == year_select"}
      ]
    },
    {
      "name": "combined_data",
      "source": "water_filtered",
      "transform": [
        {
          "type": "lookup",
          "from": "population_filtered",
          "key": "state",
          "fields": ["state"],
          "values": ["population"]
        },
        {
          "type": "formula",
          "expr": "(datum.value * 1000000) / (datum.population * 1000) / 365",
          "as": "per_capita"
        }
      ]
    },
    {
      "name": "states_geo",
      "url": "https://raw.githubusercontent.com/zanee-y/FIT3179-Dataset-Week10/main/ne_10m_admin_1_states_provinces.json",
      "format": {"type": "topojson", "feature": "states"}
    },
    {
      "name": "states_with_data",
      "source": "states_geo",
      "transform": [
        {
          "type": "formula",
          "expr": "datum.properties.Name == 'Penang' ? 'Pulau Pinang' : datum.properties.Name == 'Labuan' ? 'W.P. Labuan' : datum.properties.Name",
          "as": "state_name"
        },
        {
          "type": "lookup",
          "from": "combined_data",
          "key": "state",
          "fields": ["state_name"],
          "values": ["value", "population", "per_capita", "year"],
          "as": ["water_value", "population", "per_capita", "year"]
        }
      ]
    },
    {
      "name": "graticule",
      "transform": [
        {"type": "graticule", "extent": [[95, -5], [118, 8]], "step": [2, 2]}
      ]
    }
  ],
  
  "projections": [
    {
      "name": "projection",
      "type": "mercator",
      "center": [108, 4],
      "scale": 2700,
      "translate": [400, 250]
    }
  ],
  
  "scales": [
    {
      "name": "color",
      "type": "linear",
      "domain": [0, 1.0],
      "range": {"scheme": "blues"},
      "clamp": true
    }
  ],
  
  "legends": [
    {
      "fill": "color",
      "type": "gradient",
      "title": "Per Capita Consumption (liters/person/day)",
      "orient": "right",
      "direction": "vertical",
      "gradientLength": 200,
      "gradientThickness": 16,
      "format": ".1f",
      "titleFontSize": 12,
      "labelFontSize": 11,
      "titleLimit": 300
    }
  ],
  
  "marks": [
    {
      "type": "shape",
      "from": {"data": "graticule"},
      "encode": {
        "update": {
          "strokeWidth": {"value": 0.8},
          "stroke": {"value": "#e6e6e6"},
          "fill": {"value": null}
        }
      },
      "transform": [{"type": "geoshape", "projection": "projection"}]
    },
    {
      "type": "shape",
      "from": {"data": "states_with_data"},
      "encode": {
        "update": {
          "strokeWidth": {"value": 0.5},
          "stroke": {"value": "white"},
          "fill": [
            {"test": "datum.per_capita != null", "scale": "color", "field": "per_capita"},
            {"value": "#ddd"}
          ],
          "tooltip": {
            "signal": "{'State': datum.properties.Name, 'Sector': sector_select == 'domestic' ? 'Domestic' : 'Non-Domestic', 'Year': year_select, 'Per Capita (liters/person/day)': format(datum.per_capita, '.1f'), 'Total Consumption (million liters)': format(datum.water_value, ','), 'Population (thousands)': format(datum.population, ',.1f')}"
          }
        }
      },
      "transform": [{"type": "geoshape", "projection": "projection"}]
    }
  ],
  "config": {
    "view": { "stroke": null }
  }
};

// Line Chart Specification
var vg_lineChartSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": 800,
  "height": 500,
  "data": {
    "values": []
  },
  "transform": [
    {
      "lookup": "state",
      "from": {
        "data": {
          "url": "https://raw.githubusercontent.com/zanee-y/FIT3179-Dataset-Week10/refs/heads/main/water_consumption_clean.csv",
          "format": {"type": "csv"}
        },
        "key": "state",
        "fields": ["value", "date", "sector"]
      }
    }
  ],
  "params": [
    {
      "name": "state_select",
      "value": "Selangor",
      "bind": {
        "input": "select",
        "options": ["Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Perak", "Perlis", "Pulau Pinang", "Sabah", "Sarawak", "Selangor", "Terengganu", "W.P. Labuan"],
        "name": "Select State: "
      }
    }
  ],
  "layer": [
    {
      "data": {
        "url": "https://raw.githubusercontent.com/zanee-y/FIT3179-Dataset-Week10/refs/heads/main/water_production_clean.csv",
        "format": {"type": "csv"}
      },
      "transform": [
        {
          "calculate": "split(datum.date, '/')[2]",
          "as": "year"
        },
        {
          "filter": "datum.state == state_select"
        },
        {
          "calculate": "datum.value",
          "as": "volume"
        },
        {
          "calculate": "'Production'",
          "as": "type"
        }
      ],
      "mark": {
        "type": "line",
        "strokeWidth": 3,
        "tooltip": true
      },
      "encoding": {
        "x": {
          "field": "year",
          "type": "ordinal",
          "title": "Year"
        },
        "y": {
          "field": "volume",
          "type": "quantitative",
          "title": "Water Volume (million liters)",
          "scale": {"domain": [0, 5500]}
        },
        "color": {
          "field": "type",
          "type": "nominal",
          "scale": {
            "domain": ["Production", "Consumption"],
            "range": ["#1f77b4", "#ff7f0e"]
          },
          "legend": {"title": "Water Metric"}
        },
        "tooltip": [
          {"field": "type", "title": "Type"},
          {"field": "volume", "title": "Volume", "format": ","},
          {"field": "year", "title": "Year"}
        ]
      }
    },
    {
      "data": {
        "url": "https://raw.githubusercontent.com/zanee-y/FIT3179-Dataset-Week10/refs/heads/main/water_consumption_clean.csv",
        "format": {"type": "csv"}
      },
      "transform": [
        {
          "calculate": "split(datum.date, '/')[2]",
          "as": "year"
        },
        {
          "filter": "datum.state == state_select"
        },
        {
          "aggregate": [
            {
              "op": "sum",
              "field": "value",
              "as": "total_consumption"
            }
          ],
          "groupby": ["state", "year"]
        },
        {
          "calculate": "datum.total_consumption",
          "as": "volume"
        },
        {
          "calculate": "'Consumption'",
          "as": "type"
        }
      ],
      "mark": {
        "type": "line",
        "strokeWidth": 3,
        "tooltip": true
      },
      "encoding": {
        "x": {
          "field": "year",
          "type": "ordinal",
          "title": "Year"
        },
        "y": {
          "field": "volume",
          "type": "quantitative",
          "title": "Water Volume (million liters)",
          "scale": {"domain": [0, 5500]}
        },
        "color": {
          "field": "type",
          "type": "nominal",
          "scale": {
            "domain": ["Production", "Consumption"],
            "range": ["#1f77b4", "#ff7f0e"]
          },
          "legend": {"title": "Water Metric"}
        },
        "tooltip": [
          {"field": "type", "title": "Type"},
          {"field": "volume", "title": "Volume", "format": ","},
          {"field": "year", "title": "Year"}
        ]
      }
    }
  ],
  "config": {
    "view": {"stroke": "transparent"},
    "axis": {"grid": true, "gridColor": "#f0f0f0"}
  }
};

// Radial Chart Specification
var vg_radialSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": 400,
  "height": 400,
  "data": {
    "url": "https://raw.githubusercontent.com/zanee-y/FIT3179-Dataset-Week10/refs/heads/main/water_production_clean.csv"
  },
  "params": [
    {
      "name": "year_select",
      "value": "2022",
      "bind": {
        "input": "select",
        "options": [
          "2012", "2013", "2014", "2015", "2016",
          "2017", "2018", "2019", "2020", "2021", "2022"
        ],
        "name": "Select Year:"
      }
    }
  ],
  "transform": [
    {"calculate": "split(datum.date, '/')[2]", "as": "year"},
    {"filter": "datum.year == year_select"},
    {"calculate": "toNumber(datum.value)", "as": "value_num"},
    {
      "window": [{"op": "rank", "as": "rank"}],
      "sort": [{"field": "value_num", "order": "descending"}],
      "groupby": ["year"]
    }
  ],
  "layer": [
    {
      "mark": {
        "type": "arc",
        "innerRadius": 50,
        "outerRadius": 250,
        "stroke": "white",
        "strokeWidth": 1,
        "tooltip": true
      },
      "encoding": {
        "theta": {
          "field": "rank",
          "type": "ordinal",
          "sort": "ascending",
          "axis": null
        },
        "radius": {
          "field": "value_num",
          "type": "quantitative",
          "scale": {"type": "linear", "rangeMin": 50, "rangeMax": 250}
        },
        "color": {
          "field": "state",
          "type": "nominal",
          "title": "State",
          "scale": {
            "range": [
              "#E69F00", "#56B4E9", "#006E73", "#F0E442",
              "#0072B2", "#D55E00", "#CC79A7", "#999999",
              "#117733", "#332288", "#FFA500", "#44AA99",
              "#DDCC77", "#AA6699"
            ]
          },
          "legend": {
            "orient": "right",
            "title": "States",
            "columns": 2,
            "labelLimit": 100
          }
        },
        "tooltip": [
          {"field": "rank", "type": "quantitative", "title": "Rank"},
          {"field": "state", "type": "nominal", "title": "State"},
          {"field": "value_num", "type": "quantitative", "title": "Production", "format": ","},
          {"field": "year", "type": "ordinal", "title": "Year"}
        ]
      }
    },
    {
      "transform": [
        {"filter": "datum.rank <= 3"},
        {
          "calculate": "datum.rank + '. ' + datum.state + ' (' + format(datum.value_num, ',') + ')' ",
          "as": "label"
        }
      ],
      "mark": {
        "type": "text",
        "align": "center",
        "baseline": "middle",
        "fontSize": 9,
        "fontWeight": "bold",
        "color": "black"
      },
      "encoding": {
        "theta": {"field": "rank", "type": "ordinal", "sort": "ascending"},
        "radius": {
          "field": "value_num",
          "type": "quantitative",
          "scale": {"type": "linear", "rangeMin": 50, "rangeMax": 250}
        },
        "text": {"field": "label", "type": "nominal"}
      }
    }
  ],
  "config": {
    "view": {"stroke": null},
    "axis": {"grid": false, "labels": false, "ticks": false}
  }
};

// Bar Chart Specification
var vg_barChartSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": 800,
  "height": 500,
  "data": {
    "url": "https://raw.githubusercontent.com/zanee-y/FIT3179-Dataset-Week10/refs/heads/main/water_access_clean.csv",
    "format": {"type": "csv"}
  },
  "transform": [
    {
      "calculate": "split(datum.date, '/')[2]",
      "as": "year"
    },
    {
      "filter": "datum.year == year_select"
    },
    {
      "pivot": "strata",
      "value": "proportion",
      "groupby": ["state", "year"]
    },
    {
      "calculate": "datum.urban - datum.rural",
      "as": "access_difference"
    }
  ],
  "params": [
    {
      "name": "year_select",
      "value": "2022",
      "bind": {
        "input": "select",
        "options": ["2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022"],
        "name": "Select Year:"
      }
    }
  ],
  "layer": [
    {
      "mark": "bar",
      "encoding": {
        "x": {
          "field": "access_difference",
          "type": "quantitative",
          "title": "Urban-Rural Access Difference (%)"
        },
        "y": {
          "field": "state",
          "type": "nominal",
          "title": "State",
          "sort": {"field": "access_difference", "order": "descending"}
        },
        "color": {
          "value": "#1f77b4"
        },
        "tooltip": [
          {"field": "state", "title": "State"},
          {"field": "rural", "title": "Rural Access", "format": ".1f"},
          {"field": "urban", "title": "Urban Access", "format": ".1f"},
          {"field": "access_difference", "title": "Access Difference", "format": ".1f"},
          {"field": "year", "title": "Year"}
        ]
      }
    }
  ]
};

// Function to initialize all visualizations
function initializeVisualizations() {
  // Embed all visualizations using the var vg_ variables
  vegaEmbed('#choropleth', vg_choroplethSpec)
    .then(result => console.log('Choropleth map loaded successfully'))
    .catch(error => console.error('Error loading choropleth map:', error));
  
  vegaEmbed('#line-chart', vg_lineChartSpec)
    .then(result => console.log('Line chart loaded successfully'))
    .catch(error => console.error('Error loading line chart:', error));
  
  vegaEmbed('#radial-chart', vg_radialSpec)
    .then(result => console.log('Radial chart loaded successfully'))
    .catch(error => console.error('Error loading radial chart:', error));
  
  vegaEmbed('#bar-chart', vg_barChartSpec)
    .then(result => console.log('Bar chart loaded successfully'))
    .catch(error => console.error('Error loading bar chart:', error));
}

// Initialize visualizations when the page loads
document.addEventListener('DOMContentLoaded', function() {
  initializeVisualizations();
});

// Export specifications for potential external use
window.visualizationSpecs = {
  choropleth: vg_choroplethSpec,
  lineChart: vg_lineChartSpec,
  radial: vg_radialSpec,
  barChart: vg_barChartSpec
};
