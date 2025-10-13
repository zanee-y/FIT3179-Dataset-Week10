var vg_1 = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": 850,
  "height": 520,

  "title": {
    "text": "Malaysia — Water Consumption by State and Sector (2022)",
    "subtitle": "Domestic vs Non-Domestic water use (million liters)",
    "fontSize": 18,
    "subtitleFontSize": 13,
    "anchor": "start"
  },

  "projection": {
    "type": "mercator",
    "center": [108, 4],
    "scale": 2700,
    "translate": [450, 260]
  },

  "params": [
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
                {"state": "Johor", "domestic": 867, "nondomestic": 536},
                {"state": "Kedah", "domestic": 560, "nondomestic": 217},
                {"state": "Kelantan", "domestic": 162, "nondomestic": 77},
                {"state": "Melaka", "domestic": 228, "nondomestic": 190},
                {"state": "Negeri Sembilan", "domestic": 307, "nondomestic": 231},
                {"state": "Pahang", "domestic": 385, "nondomestic": 283},
                {"state": "Perak", "domestic": 699, "nondomestic": 289},
                {"state": "Perlis", "domestic": 80, "nondomestic": 18},
                {"state": "Penang", "domestic": 534, "nondomestic": 334},
                {"state": "Sabah", "domestic": 394, "nondomestic": 238},
                {"state": "Sarawak", "domestic": 602, "nondomestic": 463},
                {"state": "Selangor", "domestic": 2230, "nondomestic": 1350},
                {"state": "Terengganu", "domestic": 286, "nondomestic": 173},
                {"state": "Labuan", "domestic": 19, "nondomestic": 33}
              ]
            },
            "key": "state",
            "fields": ["domestic", "nondomestic"]
          }
        },
        {
          "calculate": "sector_select === 'domestic' ? datum.domestic : datum.nondomestic",
          "as": "selected_value"
        },
        {
          "calculate": "sector_select === 'domestic' ? 'Domestic' : 'Non-Domestic'",
          "as": "selected_sector"
        }
      ],
      "mark": {
        "type": "geoshape",
        "stroke": "white",
        "strokeWidth": 0.5
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
            "gradientLength": 200,
            "format": ",.0f"
          }
        },
        "tooltip": [
          { "field": "properties.Name", "title": "State" },
          { "field": "selected_sector", "title": "Sector" },
          { "field": "selected_value", "title": "Consumption (million liters)", "type": "quantitative", "format": "," }
        ]
      }
    },
    {
      "data": {
        "values": [
          {"lon": 98.8, "lat": 3.2, "note": "(Highest Consumption Area)"}
        ]
      },
      "mark": {
        "type": "text", 
        "fontSize": 9, 
        "fontWeight": "bold", 
        "fill": "black",
        "align": "left"
      },
      "encoding": {
        "longitude": {"field": "lon", "type": "quantitative"},
        "latitude": {"field": "lat", "type": "quantitative"},
        "text": {"field": "note", "type": "nominal"}
      }
    }
  ],

  "config": {
    "view": { "stroke": null }
  }
};

// Bubble Plot Visualization
var vg_2 = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": 800,
  "height": 500,
  "title": {
    "text": "Water Consumption by State and Sector (2022)",
    "subtitle": "Bubble size represents water consumption in million liters",
    "fontSize": 16,
    "subtitleFontSize": 12
  },
  "data": {
    "url": "https://raw.githubusercontent.com/zanee-y/FIT3179-Dataset-Week10/refs/heads/main/water_consumption_clean.csv",
    "format": {"type": "csv"}
  },
  "transform": [
    {
      "calculate": "datum.sector === 'domestic' ? 'Domestic' : 'Non-Domestic'",
      "as": "sector_label"
    },
    {
      "calculate": "indexof(datum.state, 'W.P.') >= 0 ? 'Federal Territory' : 'State'",
      "as": "region_type"
    },
    {
      "filter": "sector_select === 'All' || sector_select === datum.sector_label"
    }
  ],
  "params": [
    {
      "name": "sector_select",
      "value": "All",
      "bind": {
        "input": "select",
        "options": ["All", "Domestic", "Non-Domestic"],
        "name": "Filter by Sector: "
      }
    }
  ],
  "layer": [
    {
      "mark": {
        "type": "circle",
        "tooltip": true,
        "stroke": "white",
        "strokeWidth": 1
      },
      "encoding": {
        "x": {
          "field": "state",
          "type": "nominal",
          "title": "State",
          "axis": {"labelAngle": -45},
          "sort": {"field": "value", "op": "sum", "order": "descending"}
        },
        "y": {
          "field": "sector_label",
          "type": "nominal",
          "title": "Sector"
        },
        "size": {
          "field": "value",
          "type": "quantitative",
          "title": "Water Consumption (million liters)",
          "scale": {"range": [50, 800], "domain": [0, 2500]},
          "legend": {
            "title": "Consumption Scale",
            "values": [0, 500, 1000, 1500, 2000, 2500],
            "format": ",.0f",
            "gradientLength": 120
          }
        },
        "color": {
          "field": "sector_label",
          "type": "nominal",
          "title": "Sector",
          "scale": {
            "domain": ["Domestic", "Non-Domestic"],
            "range": ["#1f77b4", "#ff7f0e"]
          },
          "legend": {"orient": "bottom"}
        },
        "tooltip": [
          {"field": "state", "type": "nominal", "title": "State"},
          {"field": "sector_label", "type": "nominal", "title": "Sector"},
          {"field": "value", "type": "quantitative", "title": "Consumption (million liters)", "format": ","},
          {"field": "region_type", "type": "nominal", "title": "Region Type"}
        ]
      }
    },
    {
      "data": {
        "values": [
          {"state": "Selangor", "sector_label": "Domestic", "annotation": "Highest Domestic\nConsumption: 2,230M L"},
          {"state": "Selangor", "sector_label": "Non-Domestic", "annotation": "Highest Non-Domestic\nConsumption: 1,350M L"}
        ]
      },
      "mark": {
        "type": "text",
        "align": "center",
        "baseline": "top",
        "fontSize": 10,
        "fontWeight": "bold",
        "fill": "darkred",
        "dx": 0,
        "dy": 25,
        "tooltip": null
      },
      "encoding": {
        "x": {"field": "state", "type": "nominal"},
        "y": {"field": "sector_label", "type": "nominal"},
        "text": {"field": "annotation", "type": "nominal"}
      }
    }
  ],
  "config": {
    "view": {"stroke": "transparent"},
    "axis": {
      "grid": true,
      "gridColor": "#f0f0f0"
    },
    "background": "#fafafa",
    "legend": {
      "labelExpr": "format(datum.value, ',.0f')"
    }
  }
};

// Render both visualizations
vegaEmbed("#vis", vg_1, { actions: false }).catch(console.error);
vegaEmbed("#vis2", vg_2, { actions: false }).catch(console.error);
