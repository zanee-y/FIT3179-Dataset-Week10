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
        "name": "Select Sector: ",
        "element": "#dropdown-container"
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
            "scheme": "blues",
            "range": [0, 2500]
          },
          "legend": {
            "orient": "none"
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
    "view": { "stroke": null },
    "legend": { "disable": true }
  }
};

// Create a custom container for the dropdown
const dropdownContainer = document.createElement('div');
dropdownContainer.id = 'dropdown-container';
dropdownContainer.style.marginBottom = '10px';
dropdownContainer.style.textAlign = 'left';

// Insert the dropdown container before the visualization
const visElement = document.getElementById('vis');
visElement.parentNode.insertBefore(dropdownContainer, visElement);

// render into div with id="vis"
vegaEmbed("#vis", vg_1, { actions: false }).catch(console.error);
