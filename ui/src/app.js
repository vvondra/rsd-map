/* global window, fetch */
import React, { Component } from 'react';
import { render } from 'react-dom';
import MapGL from 'react-map-gl';
import ControlPanel from './control-panel';
import DetailPanel from './detail-panel';
import ProjectPanel from './project-panel';
import Sidebar from './sidebar';

import { dataLayer, defaultMapStyle } from './map-style.js';
import { stripHtml, truncate } from './utils';
import { fromJS } from 'immutable';
import { json as requestJson } from 'd3-request';

import './app.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoidnZvbmRyYSIsImEiOiJjajQ3NTZtajQwMTJtMzNxcWR5YXA3eGsyIn0.upVtttpfFBwd5IlbnZkPkQ'; // Set your mapbox token here

export default class App extends Component {

  state = {
    mapStyle: defaultMapStyle,
    regions: [],
    region: [],
    roads: [],
    road: [],
    statuses: [],
    status: [],
    data: null,
    hoveredFeature: null,
    clickedFeature: null,
    loadedFeature: null,
    viewport: {
      latitude: 49.7437506,
      longitude: 15.3386478,
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

    requestJson('/api/regions', (error, response) => {
      if (!error) {
        this.setState({ regions: response });
      }
    });

    requestJson('/api/statuses', (error, response) => {
      if (!error) {
        this.setState({
          statuses: response,
          status: response.filter(s => s != 'constructionStatus_operational')
        });
      }
    });

    requestJson('/api/roads', (error, response) => {
      if (!error) {
        this.setState({ roads: response });
      }
    });

    requestJson('/api/plans', (error, response) => {
      if (!error) {
        this._loadLayer(response).then(this._refresh);
      }
    });
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
    let url = '/api/projects?';
    let params = [];
    this.state.region.forEach((region) => params.push('region=' + region))
    this.state.road.forEach((road) => params.push('road=' + road))
    this.state.status.forEach((status) => params.push('status=' + status))

    requestJson(url + params.join('&'), (error, response) => {
      if (!error) {
        this._loadData(response);
      }
    });
  }

  _loadData = data => {
    const mapStyle = this.state.mapStyle
      // Add geojson source to map
      .setIn(['sources', 'projects'], fromJS({ type: 'geojson', data }));
    this.setState({ data, mapStyle });
  };

  _loadLayer = data => {
    const plannedRoutesDataLayer = fromJS({
      "id": "planned_routes",
      "type": "line",
      "source": {
        "type": "geojson",
        "data": data
      },
      "layout": {
        "line-join": "round",
        "line-cap": "round"
      },
      "paint": {
          "line-color": "#888",
          "line-width": {
            "base": 1.5,
            "stops": [
                [
                    15,
                    2
                ],
                [
                    18,
                    7
                ]
            ]
        }
      }
    });

    const mapStyle = this.state.mapStyle.set(
      'layers',
      this.state.mapStyle.get('layers')
        .push(plannedRoutesDataLayer)
        .push(dataLayer)
      );
    
    return new Promise((resolve) => this.setState({ mapStyle }, resolve));
  };

  _updateSettings = (name, value) => {
    if (name === 'region' || name === 'road' || name === 'status') {
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
    if (!this.state.data) { return; }
    const { features, srcEvent: { offsetX, offsetY } } = event;
    const hoveredFeature = features && features.find(f => f.layer.id === 'data');

    this.setState({ hoveredFeature, x: offsetX, y: offsetY });
  };

  _onClick = event => {
    if (!this.state.data) { return; }
    const { features, srcEvent: { offsetX, offsetY } } = event;
    const clickedFeature = features && features.find(f => f.layer.id === 'data');

    this.setState({ clickedFeature, x: offsetX, y: offsetY, loadedFeature: null });
  };

  _loadFeature = id => {
    requestJson('/api/projects/' + id, (error, response) => {
      if (!error) {
        this.setState({ loadedFeature: response });
      }
    });
  }

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
        feature={clickedFeature.properties}
        onSelectProject={this._loadFeature.bind(this, clickedFeature.properties.id)}
      />
    );
  }

  _renderProjectPanel() {
    const { loadedFeature } = this.state;
    
    return loadedFeature && (
      <ProjectPanel containerComponent={this.props.containerComponent}
        project={loadedFeature} />
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

        {this._renderProjectPanel()}
      </div>
    );
  }

}
