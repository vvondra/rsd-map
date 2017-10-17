import React, { PureComponent } from 'react';
import { stripHtml, getHumanSize } from './utils';

const defaultContainer = ({ children }) => <div className="panel project-panel">{children}</div>;

export default class ProjectPanel extends PureComponent {

  renderMapImage() {
    const { mapImage, attachments } = this.props.project;
    if (mapImage) {
      const link = attachments.find(attachment => attachment.id == mapImage).downloadLink;
      return <a href={link} target="_blank">
          <img
          src={link}
          />
        </a>;
    }
  }

  renderAttachments() {
    const { attachments } = this.props.project;

    return attachments.filter(attachment => !attachment.image).map(attachment => {
      return <tr>
        <td><a href={attachment.downloadLink} target="_blank">{attachment.name}</a></td>
        <td>{getHumanSize(attachment.size)}</td>
      </tr>;
    })
  }

  render() {
    const Container = this.props.containerComponent || defaultContainer;
    const { defaultTitle } = this.props.project;

    return (
      <Container>
        <h2>{defaultTitle}</h2>

        <h3>Ke stažení</h3>
        <table>
          {this.renderAttachments()}
        </table>

        {this.renderMapImage()}

      </Container>
    );
  }
}
