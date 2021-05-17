import React from 'react';
import Utilities from '../Utilities.js';

class FeedItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const item = this.props.data.feedData;
    let feedImage = this.props.data.feedImage,
        feedTitle = this.props.data.feedTitle,
        feedUrl   = this.props.data.feedUrl,
        itemTitle = Utilities.removeCDATA(item.querySelector("title").innerHTML),
        itemUrl   = Utilities.removeCDATA(item.querySelector("link").innerHTML),
        itemDesc  = Utilities.removeCDATA(item.querySelector("description").innerHTML);
    if (itemDesc.length > 280) {
      itemDesc = Utilities.truncateString(itemDesc);
    }

    return (
      <div className="item">
        { (feedImage) ? <img loading="lazy" className="item__image" src={feedImage} /> : '' }
        <h1 className="item__source"><a className="item__source-link" href={feedUrl} dangerouslySetInnerHTML={{__html: feedTitle}}></a></h1>
        <h2 className="item__title"><a className="item__link" href={itemUrl} target="_blank" dangerouslySetInnerHTML={{__html: itemTitle}}></a></h2>
        <div className="item__desc" dangerouslySetInnerHTML={{__html: itemDesc}}></div>
      </div>
    );
  }
}

export default FeedItem;
