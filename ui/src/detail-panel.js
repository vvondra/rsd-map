import React, { PureComponent } from 'react';
import { stripHtml } from './utils';

const defaultContainer = ({ children }) => <div className="panel detail-panel">{children}</div>;

export default class ControlPanel extends PureComponent {

  render() {
    const Container = this.props.containerComponent || defaultContainer;
    const { description, title } = this.props.feature;

    return (
      <Container>
        <h2>{title}</h2>
        <p>
          {stripHtml(description)}
        </p>
        <button onClick={this.props.onSelectProject}>Zobrazit podrobnosti</button>
      </Container>
    );
  }
}
