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
        
      </Container>
    );
  }
}
