import React, { PureComponent } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

const defaultContainer = ({ children }) => <div className="panel control-panel">{children}</div>;

export default class ControlPanel extends PureComponent {

  generateOptions(options) {
    return Object.keys(options).reduce(function(acc, key) {
      return acc.concat([
        {
          label: options[key].name,
          value: options[key]._id
        }
      ]);
    }, []).sort((a, b) => a.label.localeCompare(b.label, 'cs-CZ'));
  }

  generateStatusOptions(options) {
    const translations = {
      "constructionStatus_operational": "V provozu",
      "constructionStatus_thisYear": "Dokončení letos",
      "constructionStatus_preparing": "V přípravě",
      "constructionStatus_realization": "V realizaci"
    }

    return options.reduce(function(acc, key) {
      return acc.concat([
        {
          label: translations[key],
          value: key
        }
      ]);
    }, []);
  }

  render() {
    const Container = this.props.containerComponent || defaultContainer;
    const { settings } = this.props;

    return (
      <Container>
        <div key="region" className="input">
          <Select
            placeholder="Kraj..."
            name="form-field-name"
            value={settings.region}
            multi={true}
            options={this.generateOptions(settings.regions)}
            onChange={this.props.onChange.bind(undefined, 'region')}
          />
        </div>
        <div key="status" className="input">
          <Select
            placeholder="Fáze výstavby..."
            name="form-field-name"
            value={settings.status}
            multi={true}
            options={this.generateStatusOptions(settings.statuses)}
            onChange={this.props.onChange.bind(undefined, 'status')}
          />
        </div>
        <div key="road" className="input">
          <Select
            placeholder="Silnice..."
            name="form-field-name"
            value={settings.road}
            multi={true}
            options={this.generateOptions(settings.roads)}
            onChange={this.props.onChange.bind(undefined, 'road')}
          />
        </div>
        <div className="attribution">
          <a href="https://www.rsd.cz/wps/portal/web/mapa-projektu">© ŘSD | </a>
          <a href="https://www.mapbox.com/about/maps/">© Mapbox | </a>
          <a href="http://www.openstreetmap.org/copyright">© OpenStreetMap | </a>
          <a href="https://www.mapbox.com/map-feedback/" target="_blank"><strong>Improve this map</strong></a>
        </div>
        <div className="attribution">
          <a href="https://github.com/vvondra/rsd-map">github.com/vvondra/rsd-map | </a>
          <a href="https://github.com/vvondra/rsd-map/issues/new">nápady</a>
        </div>
        
      </Container>
    );
  }
}
