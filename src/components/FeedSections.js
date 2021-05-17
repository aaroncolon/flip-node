import React from 'react';

import { ThemeContext } from '../theme-context';

import ButtonToggleTheme from './ButtonToggleTheme';
import ButtonRefresh from './ButtonRefresh';
import ButtonRotate from './ButtonRotate';
import FeedItem from './FeedItem';

import feeds from '../Feeds';

class FeedSections extends React.Component {
  constructor(props) {
    super(props);

    // init vars
    this.newRssFeedsData = [];
    this.rssFeedsData    = [];
    this.REFRESH_INT     = 300000;
    this.rotateAmount    = 180;
    this.timerID         = null;

    // bind event handlers
    this.doRotate    = this.doRotate.bind(this);
    this.doRefresh   = this.doRefresh.bind(this);

    // init state
    this.state = {
      contentTop: [],
      contentBottom: [],
      newContentAvailable: false,
      // rssFeedsData: [], // all data for new data detection
      rotate: 0
    };
  }

  async componentDidMount() {
    // fetch feed data
    try {
      const response = await feeds.fetchAllFeeds();

      this.rssFeedsData = response;

      this.setState({
        contentTop: this.getContentTop(response),
        contentBottom: this.getContentBottom(response),
        // rssFeedsData: response
      });
    } catch (error) {
      console.log(error);
    }

    // init interval checkNewContent
    this.initCheckNewContent();
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  async checkNewContent() {
    try {
      const response = await feeds.fetchAllFeeds();

      if (feeds.newContentAvailable(response, this.rssFeedsData)) {
        // this.newRssFeedsData = response;
        this.newRssFeedsData = feeds.getNewContent(response, this.rssFeedsData);

        this.setState({
          newContentAvailable: true
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  doRefresh(e) {
    let contentTop = this.getContentTop(this.newRssFeedsData);
    let contentBottom = this.getContentBottom(this.newRssFeedsData);

    this.rssFeedsData = this.newRssFeedsData.concat(this.rssFeedsData);

    this.setState((prevState) => ({
      contentTop: contentTop.concat(prevState.contentTop),
      contentBottom: contentBottom.concat(prevState.contentBottom),
      newContentAvailable: false,
      // rssFeedsData: this.newRssFeedsData.concat(prevState.rssFeedsData) // prepend add new content to rssFeedsData
    }));

    this.resetCheckNewContent();
  }

  initCheckNewContent() {
    this.timerID = setInterval(
      () => this.checkNewContent(),
      this.REFRESH_INT
    );
  }

  resetCheckNewContent() {
    clearInterval(this.timerID);
    this.initCheckNewContent();
  }

  doRotate(e) {
    this.setState((prevState, prevProps) => ({
      rotate: prevState.rotate + this.rotateAmount
    }));
  }

  // For now, fake top/bottom content by slicing RSS Feed Data
  getContentTop(data) {
    let content = [];

    // if (data.length && data.length > 2) {
    //   content = data.slice(0, Math.ceil(data.length / 2)); // [0, 1, 2]
    // } else if (data.length && data.length === 1) {
    //   content = data[0];
    // }

    if (data.length) {
      content = data.slice(0, Math.ceil(data.length / 2)); // [0, 1, 2]
    }

    return content;
  }
  getContentBottom(data) {
    let content = [];

    if (data.length && data.length > 2) {
      content = data.slice(Math.ceil(data.length / 2)); // [0, 1, 2]
    } else if (data.length && data.length === 2){
      content = data.slice(1);
    }

    return content;
  }

  doContentTop() {
    const content = this.state.contentTop;
    return (!content || !content.length) ? <div className="item">Loading...</div> : content.map((data, index) => {
      return <FeedItem key={'item-' + index} data={data} />;
    });
  }
  doContentBottom() {
    const content = this.state.contentBottom;
    return (!content || !content.length) ? <div className="item">Loading...</div> : content.map((data, index) => {
      return <FeedItem key={'item-' + index} data={data} />;
    });
  }

  render() {
    const contentTop = this.doContentTop();
    const contentBottom = this.doContentBottom();

    return (
      <>
        <ButtonToggleTheme />
        <ButtonRefresh doRefresh={this.doRefresh} isVisible={this.state.newContentAvailable} />
        <ButtonRotate doRotate={this.doRotate} />

        <div id="container-rotate" className="container-rotate" style={{ transform: 'rotate('+ this.state.rotate +'deg)' }}>

          <div id="section-top" className={"section section-top section-top--" + this.context.theme}>
            <div id="section-top__inner" className="section__inner">
              {contentTop}
            </div>
          </div>

          <div id="section-bottom" className={"section section-bottom section-bottom--" + this.context.theme}>
            <div id="section-bottom__inner" className="section__inner">
              {contentBottom}
            </div>
          </div>

        </div>
      </>
    );
  }
}
FeedSections.contextType = ThemeContext; // @NOTE access within Class with this.context

export default FeedSections;
