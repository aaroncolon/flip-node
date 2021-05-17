import React from 'react';
import FeedItem from './FeedItem.js';

class SectionBottom extends React.Component {
  constructor(props) {
    super(props);
  }

  handleClick(e) {
    e.preventDefault();
  }

  render() {
    const items = (!this.props.content) ? 'No Content Available.' : this.props.content.map((data, index) => {
      return <FeedItem key={'item-' + index} data={data} />;
    });

    return (
      <div id="section-bottom" className="section section--top section-bottom">
        <div id="section-bottom__inner" className="section__inner">
          {items}
        </div>
      </div>
    );
  }
}

export default SectionBottom;
