// Choropleth Map Visualization
var vg_1 = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": 800,
  "height": 500,

  "title": {
    "text": "Malaysia — Water Consumption by State and Sector (2012-2022)",
    "subtitle": "Domestic vs Non-Domestic water use (million liters)",
    "fontSize": 18,
    "subtitleFontSize": 13,
    "anchor": "start"
  },

  "projection": {
    "type": "mercator",
    "center": [108, 4],
    "scale": 2700,
    "translate": [400, 250]
  },

  "params": [
    {
      "name": "year_select",
      "value": "2022",
      "bind": {
        "input": "select",
        "options": ["2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022"],
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

  "layer": [
    {
      "data": {
        "graticule": { "extent": [[95, -5], [120, 8]], "step": [2, 2] }
      },
      "mark": {
        "type": "geoshape",
        "fill": null,
        "stroke": "#e6e6e6",
        "strokeWidth": 0.8
      }
    },
    {
      "data": {
        "url": "https://raw.githubusercontent.com/zanee-y/FIT3179-Dataset-Week10/main/ne_10m_admin_1_states_provinces.json",
        "format": { "type": "topojson", "feature": "states" }
      },
      "mark": {
        "type": "geoshape",
        "fill": "#f5f5f5",
        "stroke": "#cccccc",
        "strokeWidth": 0.6
      }
    },
    {
      "data": {
        "url": "https://raw.githubusercontent.com/zanee-y/FIT3179-Dataset-Week10/main/ne_10m_admin_1_states_provinces.json",
        "format": { "type": "topojson", "feature": "states" }
      },
      "transform": [
        {
          "lookup": "properties.Name",
          "from": {
            "data": {
              "values": [
                {"state": "Johor", "domestic_2022": 867, "nondomestic_2022": 536},
                {"state": "Kedah", "domestic_2022": 560, "nondomestic_2022": 217},
                {"state": "Kelantan", "domestic_2022": 162, "nondomestic_2022": 77},
                {"state": "Melaka", "domestic_2022": 228, "nondomestic_2022": 190},
                {"state": "Negeri Sembilan", "domestic_2022": 307, "nondomestic_2022": 231},
                {"state": "Pahang", "domestic_2022": 385, "nondomestic_2022": 283},
                {"state": "Perak", "domestic_2022": 699, "nondomestic_2022": 289},
                {"state": "Perlis", "domestic_2022": 80, "nondomestic_2022": 18},
                {"state": "Penang", "domestic_2022": 534, "nondomestic_2022": 334},
                {"state": "Sabah", "domestic_2022": 394, "nondomestic_2022": 238},
                {"state": "Sarawak", "domestic_2022": 602, "nondomestic_2022": 463},
                {"state": "Selangor", "domestic_2022": 2230, "nondomestic_2022": 1350},
                {"state": "Terengganu", "domestic_2022": 286, "nondomestic_2022": 173},
                {"state": "Labuan", "domestic_2022": 19, "nondomestic_2022": 33}
              ]
            },
            "key": "state",
            "fields": ["domestic_2022", "nondomestic_2022"]
          }
        },
        {
          "calculate": "sector_select === 'domestic' ? datum.domestic_2022 : datum.nondomestic_2022",
          "as": "selected_value"
        },
        {
          "calculate": "sector_select === 'domestic' ? 'Domestic' : 'Non-Domestic'",
          "as": "selected_sector"
        },
        {
          "calculate": "year_select",
          "as": "display_year"
        }
      ],
      "mark": {
        "type": "geoshape",
        "stroke": "white",
        "strokeWidth": 0.5,
        "tooltip": true
      },
      "encoding": {
        "color": {
          "field": "selected_value",
          "type": "quantitative",
          "title": "Water Consumption (million liters)",
          "scale": { 
            "domain": [0, 2500], 
            "scheme": "blues"
          },
          "legend": {
            "orient": "right",
            "direction": "vertical",
            "gradientLength": 120,
            "format": ",.0f"
          }
        },
        "tooltip": [
          { "field": "properties.Name", "title": "State" },
          { "field": "selected_sector", "title": "Sector" },
          { "field": "display_year", "title": "Year" },
          { "field": "selected_value", "title": "Consumption (million liters)", "type": "quantitative", "format": "," }
        ]
      }
    }
  ],

  "config": {
    "view": { "stroke": null }
  }
};

// Line Chart Visualization
var vg_2 = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": 800,
  "height": 500,

  "title": {
    "text": "Water Production vs Consumption Trends by State (2012-2022)",
    "subtitle": "Blue line represents production, orange line represents consumption",
    "fontSize": 16,
    "subtitleFontSize": 12
  },

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
    },
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
        "type": "point",
        "size": 60,
        "tooltip": true,
        "fill": "#1f77b4",
        "stroke": "white",
        "strokeWidth": 1
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
          "title": "Water Volume (million liters)"
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
        "type": "point",
        "size": 60,
        "tooltip": true,
        "fill": "#ff7f0e",
        "stroke": "white",
        "strokeWidth": 1
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
          "title": "Water Volume (million liters)"
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

// Radial Chart Visualization
var vg_3 = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  
  "title": {
    "text": "Annual Water Production Distribution by State",
    "subtitle": "Radial view showing water production across Malaysian states",
    "fontSize": 16,
    "subtitleFontSize": 12
  },

  "width": 600,
  "height": 600,

  "data": {
    "url": "https://raw.githubusercontent.com/zanee-y/FIT3179-Dataset-Week10/refs/heads/main/water_production_clean.csv"
  },

  "transform": [
    {
      "calculate": "split(datum.date, '/')[2]",
      "as": "year"
    },
    {
      "filter": "datum.year == year_select"
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
          "field": "state",
          "type": "nominal",
          "axis": null
        },
        "radius": {
          "field": "value",
          "type": "quantitative",
          "scale": {"type": "linear", "rangeMin": 50, "rangeMax": 250},
          "stack": false
        },
        "color": {
          "field": "state",
          "type": "nominal",
          "title": "State",
          "scale": {
            "range": ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#aec7e8", "#ffbb78", "#98df8a", "#ff9896"]
          },
          "legend": {
            "orient": "right",
            "title": "States",
            "columns": 2,
            "labelLimit": 100
          }
        },
        "tooltip": [
          {"field": "state", "type": "nominal", "title": "State"},
          {"field": "value", "type": "quantitative", "title": "Production", "format": ","},
          {"field": "year", "type": "ordinal", "title": "Year"}
        ]
      }
    },
    {
      "mark": {
        "type": "text",
        "align": "center",
        "baseline": "middle",
        "fontSize": 10,
        "fontWeight": "bold"
      },
      "encoding": {
        "theta": {"field": "state", "type": "nominal"},
        "radius": {"value": 270},
        "text": {"field": "state", "type": "nominal"},
        "color": {"value": "black"}
      }
    }
  ],

  "config": {
    "view": {"stroke": null},
    "axis": {"grid": false, "labels": false, "ticks": false}
  }
};

// Bar Chart Visualization
var vg_4 = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": 800,
  "height": 500,

  "title": {
    "text": "Urban-Rural Water Access Difference by State",
    "subtitle": "Positive values indicate higher urban access, negative values indicate higher rural access",
    "fontSize": 16,
    "subtitleFontSize": 12
  },

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
};

// Render all visualizations
vegaEmbed("#choropleth", vg_1, { actions: false }).catch(console.error);
vegaEmbed("#line-chart", vg_2, { actions: false }).catch(console.error);
vegaEmbed("#radial-chart", vg_3, { actions: false }).catch(console.error);
vegaEmbed("#bar-chart", vg_4, { actions: false }).catch(console.error);
