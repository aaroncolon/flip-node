import React from 'react';

import { theme, ThemeContext } from '../theme-context';

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
    this.REFRESH_INT     = 15000;
    this.rotateAmount    = 180;
    this.timerID         = null;

    // init state
    this.state = {
      newContentAvailable: false,
      rssFeedsData: [],
      rotate: 0,
      theme: theme
    };

    // bind event handlers
    this.toggleTheme = this.toggleTheme.bind(this);
    this.doRotate    = this.doRotate.bind(this);
    this.doRefresh   = this.doRefresh.bind(this);
  }

  toggleTheme() {
    this.setState((prevState) => ({
      theme: (prevState.theme === 'dark') ? 'light' : 'dark'
    }));
  }

  async componentDidMount() {
    // fetch feed data
    try {
      const response = await feeds.fetchAllFeeds();

      this.setState({
        rssFeedsData: response
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

      if (feeds.newContentAvailable(response, this.state.rssFeedsData)) {
        this.newRssFeedsData = response;
        this.setState({
          newContentAvailable: true
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  doRefresh(e) {
    this.setState({
      newContentAvailable: false,
      rssFeedsData: this.newRssFeedsData
    });

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

  getContentTop() {
    const content = (this.state.rssFeedsData.length) ? this.state.rssFeedsData.slice(0, (this.state.rssFeedsData.length - 1) / 2) : null;
    return (!content) ? 'No Content Available.' : content.map((data, index) => {
      return <FeedItem key={'item-' + index} data={data} />;
    });
  }

  getContentBottom() {
    const content = (this.state.rssFeedsData.length) ? this.state.rssFeedsData.slice((this.state.rssFeedsData.length - 1) / 2) : null;
    return (!content) ? 'No Content Available.' : content.map((data, index) => {
      return <FeedItem key={'item-' + index} data={data} />;
    });
  }

  render() {
    const contentTop = this.getContentTop();
    const contentBottom = this.getContentBottom();

    return (
      <>
        <ThemeContext.Provider value={this.state.theme}>

          <ButtonToggleTheme changeTheme={this.toggleTheme} name="aaron" />
          <ButtonRefresh doRefresh={this.doRefresh} isVisible={this.state.newContentAvailable} />
          <ButtonRotate doRotate={this.doRotate} />

          <div id="container-rotate" className={"container-rotate container-rotate--" + this.state.theme} style={{ transform: 'rotate('+ this.state.rotate +'deg)' }}>

            <div id="section-top" className="section section--top section-top">
              <div id="section-top__inner" className="section__inner">
                {contentTop}
              </div>
            </div>

            <div id="section-bottom" className="section section--top section-bottom">
              <div id="section-bottom__inner" className="section__inner">
                {contentBottom}
              </div>
            </div>

          </div>

        </ThemeContext.Provider>
      </>
    );
  }
}
// FeedSections.contextType = ThemeContext; // @NOTE access within Class with this.context

export default FeedSections;
