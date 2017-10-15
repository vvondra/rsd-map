/* global window, fetch */
import React, { Component } from 'react';
import { render } from 'react-dom';
import MapGL from 'react-map-gl';
import ControlPanel from './control-panel';
import DetailPanel from './detail-panel';
import Sidebar from './sidebar';

import { defaultMapStyle, dataLayer } from './map-style.js';
import { stripHtml, truncate } from './utils';
import { fromJS } from 'immutable';
import { json as requestJson } from 'd3-request';

const MAPBOX_TOKEN = 'pk.eyJ1IjoidnZvbmRyYSIsImEiOiJjajQ3NTZtajQwMTJtMzNxcWR5YXA3eGsyIn0.upVtttpfFBwd5IlbnZkPkQ'; // Set your mapbox token here

export default class App extends Component {

  state = {
    mapStyle: defaultMapStyle,
    regions: [],
    region: [],
    roads: [],
    road: [],
    data: null,
    hoveredFeature: null,
    clickedFeature: null,
    viewport: {
      latitude: 50.54065384622211,
      longitude: 14.54048439860344,
      zoom: 7,
      bearing: 0,
      pitch: 0,
      width: 500,
      height: 500
    }
  };

  componentDidMount() {
    window.addEventListener('resize', this._resize);
    this._resize();

    requestJson('http://localhost:8080/regions', (error, response) => {
      if (!error) {
        this.setState({ regions: response });
      }
    });

    requestJson('http://localhost:8080/roads', (error, response) => {
      if (!error) {
        this.setState({ roads: response.sort((a, b) => a.name > b.name) });
      }
    });

    this._refresh();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resize);
  }

  _resize = () => {
    this.setState({
      viewport: {
        ...this.state.viewport,
        width: this.props.width || window.innerWidth,
        height: this.props.height || window.innerHeight
      }
    });
  };

  _refresh = () => {
    let url = 'http://localhost:8080/?';
    let params = [];
    this.state.region.forEach((region) => params.push('region=' + region))
    this.state.road.forEach((road) => params.push('road=' + road))

    requestJson(url + params.join('&'), (error, response) => {
      if (!error) {
        this._loadData(response);
      }
    });
  }

  _loadData = data => {
    const mapStyle = defaultMapStyle
      // Add geojson source to map
      .setIn(['sources', 'projects'], fromJS({ type: 'geojson', data }))
      // Add point layer to map
      .set('layers', defaultMapStyle.get('layers').push(dataLayer));
    this.setState({ data, mapStyle });
  };

  _updateSettings = (name, value) => {
    if (name === 'region' || name === 'road') {
      if (value == '-') {
        value = [];
      } else {
        value = value.map((el) => el.value);
      }
      this.setState(
        {
          [name]: value,
          clickedFeature: null
        },
        this._refresh
      );
    }
  };

  _onViewportChange = viewport => this.setState({ viewport });

  _onHover = event => {
    const { features, srcEvent: { offsetX, offsetY } } = event;
    const hoveredFeature = features && features.find(f => f.layer.id === 'data');

    this.setState({ hoveredFeature, x: offsetX, y: offsetY });
  };

  _onClick = event => {
    const { features, srcEvent: { offsetX, offsetY } } = event;
    const clickedFeature = features && features.find(f => f.layer.id === 'data');

    this.setState({ clickedFeature, x: offsetX, y: offsetY });
  };

  _renderTooltip() {
    const { hoveredFeature, x, y } = this.state;

    return hoveredFeature && (
      <div className="tooltip" style={{ left: x, top: y }}>
        <h2>{hoveredFeature.properties.title}</h2>
        <div>{truncate(stripHtml(hoveredFeature.properties.description))}</div>
      </div>
    );
  }

  _renderDetail() {
    const { clickedFeature } = this.state;
    
    return clickedFeature && (
      <DetailPanel containerComponent={this.props.containerComponent}
      feature={clickedFeature.properties} />
    );
  }

  render() {

    const { viewport, mapStyle } = this.state;

    return (
      <div>
        <MapGL
          {...viewport}
          mapStyle={mapStyle}
          onViewportChange={this._onViewportChange}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          onHover={this._onHover}
          onClick={this._onClick}
          >
          {this._renderTooltip()}
        </MapGL>

        <Sidebar>
          <ControlPanel containerComponent={this.props.containerComponent}
            settings={this.state} onChange={this._updateSettings} />

          {this._renderDetail()}
        </Sidebar>
      </div>
    );
  }

}
