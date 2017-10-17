import {fromJS} from 'immutable';
import MAP_STYLE from './map-style-basic-v8.json';

// For more information on data-driven styles, see https://www.mapbox.com/help/gl-dds-ref/
export const dataLayer = fromJS({
  id: 'data',
  source: 'projects',
  type: 'circle',
  interactive: true,
  paint: {
    // make circles larger as the user zooms from z12 to z22
    'circle-radius': {
        'base': 7,
        'stops': [[12, 7], [22, 180]]
    },
    // color circles by ethnicity, using data-driven styles
    'circle-color': {
        property: 'roadType',
        type: 'categorical',
        stops: [
            ['firstClassWay', '#3B4BA6'],
            ['highway', '#CC2929']
        ]
    },
    'circle-stroke-width': 10,
    'circle-stroke-opacity': 0
}
});

const defaultSource = fromJS({
    type: 'geojson',
    data: {
        type: 'FeatureCollection',
        features: []
    }
});

const defaultStyle = fromJS(MAP_STYLE);

export const defaultMapStyle = defaultStyle
    .setIn(['sources', 'projects'], defaultSource);
