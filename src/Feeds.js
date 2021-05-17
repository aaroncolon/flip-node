import Utilities from './Utilities';
import { feedUrls } from './feedUrls';

class Feeds {

  constructor() {
    this.POST_URL       = '/inc/getter.php';
    this.GET_PARAMS_URL = '/getParams/';
    this.GET_URL        = '/get';
    this.REFRESH_INT    = 300000;
    this.domParser      = new DOMParser();
    this.xmlSerializer  = new XMLSerializer();

    this.rssFeedsData; // local reference to parsed XML String and pubDate
    this.feedLatest;
    this.intervalIdRefresh;
  }

  async init() {
    this.rssFeedsData = await this.checkStorage();
    this.initCheckNewContent();
  }

  initCheckNewContent() {
    this.intervalIdRefresh = window.setInterval(this.checkNewContent, this.REFRESH_INT);
  }

  /**
   * Checks for new content. localStorage first, fetch second.
   */
  async checkNewContent() {
    // Manually check localStorage for changes
    // @TODO use eventListener instead to change across tabs...

    // if cache pubDate is newer than current pubDate, render cache data
    let newFeedData = await this.checkStorage();

    // check all cached pubDates
    if (newContentAvailable(newFeedData, this.rssFeedsData)) {
      console.log('cacheData newer, rendering');
      // save new data reference
      this.rssFeedsData = newFeedData;
      this.showRefreshButton();
    } else {
      console.log('cacheData older, fetching fresh...');
      // get all feeds again
      newFeedData = await this.fetchAllFeeds();

      // check all fresh pubDates
      if (newContentAvailable(newFeedData, this.rssFeedsData)) {
        console.log('new content available, showing refresh button...');
        // save new data reference
        this.rssFeedsData = newFeedData;
        this.showRefreshButton();
      }
    }
  }

  /**
   * Check if new content is availble
   *
   * @param {Array} newData the new data
   * @param {Array} currData the currently rendered data
   * @return {Boolean}
   */
  newContentAvailable(newData, currData) {
    const newContentAvailable = newData.findIndex((el, index) => {
      // return el.pubDate > currData[index].pubDate; // @NOTE this works when comparing entire, uniform datasets
      return el.pubDate > currData[0].pubDate;
    }, this);
    return (newContentAvailable !== -1) ? true : false;
  }

  /**
   * Get new content
   *
   * @param {Array} newData the new data
   * @param {Array} currData the currently rendered data
   * @return {Boolean}
   */
  getNewContent(newData, currData) {
    // subtract the oldData[0].pubdate - newData[i].pubDate
    // first non-negative && non-zero difference is the oldest fresh item
    // === 0 test removes need to increment the firstNewItemIndex

    let oldDataStartIndex = newData.findIndex((el) => {
      return ((el.pubDate - currData[0].pubDate) <= 0); // <= 0 covers case where old article pubDate removed or updated
    });
    return (oldDataStartIndex > -1) ? newData.slice(0, oldDataStartIndex) : [];
  }

  /**
   * Check LocalStorage
   */
  async checkStorage() {
    if (!localStorage.getItem('rssFeedsData')) {
      return await this.fetchAllFeeds();
    }
    return this.getStorage('rssFeedsData');
  }

  /**
   * Get data from localStorage
   *
   * @param {String} key localStorage key to get
   * @return {Array} parsed localStorage data
   */
  getStorage(key) {
    const parsedData = JSON.parse(localStorage.getItem(key));
    return parsedData.map((feed) => {
      return {
        pubDate   : feed.pubDate,
        feedData  : this.parseFeedData(feed.feedDataRaw),
        feedTitle : feed.feedTitle,
        feedUrl   : feed.feedUrl,
        feedImage : feed.feedImage
      };
    });
  }

  /**
   * Set localStorage
   *
   * @param {String} key
   * @param {String} value
   */
  populateStorage(key, value) {
    localStorage.setItem(key, value);
  }

  /**
   * Perform a PHP cURL for cross-origin requests
   *
   * @param {String} url the URL to fetch
   * @return {Promise}
   */
  fetchProxy(url) {
    const options = {
      'url': url
    };
    // return Utilities.postData(this.POST_URL, options, true);
    return Utilities.getData(this.GET_URL, options, true);
  }

  /**
   * Fetch and parse all feeds
   *
   * @return {Array} parsed and sorted feed data
   */
  fetchAllFeeds() {
    const promises = feedUrls.map(url => this.fetchProxy(url));

    return Promise.all(promises).then((values) => {
      return this.processFeedsData(values);
    });
  }

  /**
   * Process data from feeds. Parses and optionally, caches.
   *
   * @param {Array} feeds feed data
   * @return {Array} parsed and sorted feed data
   */
  processFeedsData(feeds, noCache = true) {
    // parse the feeds
    const parsedData = feeds.map((feed) => {
      const feedParsed    = this.parseFeedData(feed);
      const feedTitle     = Utilities.removeCDATA(feedParsed.querySelector("title").innerHTML);
      const feedUrl       = feedParsed.querySelector("link").innerHTML;
      const feedImage     = (feedParsed.querySelector("image url")) ? feedParsed.querySelector("image url").innerHTML : '';
      const firstFeedItem = feedParsed.querySelector('item');
      const pubDate       = this.getFeedPubDate(feedParsed);

      return {
        pubDate   : pubDate,
        feedData  : firstFeedItem,
        feedTitle : feedTitle,
        feedUrl   : feedUrl,
        feedImage : feedImage
      };
    });

    this.sortFeedsLatest(parsedData);

    // check if cache is stale
    if (!noCache && this.isCacheStale(parsedData)) {
      const cacheData = parsedData.map((item) => {
        // serialize firstFeedItem for localStorage
        const firstFeedItemString = this.xmlSerializer.serializeToString(item.feedData);
        return {
          pubDate     : item.pubDate,
          feedDataRaw : firstFeedItemString,
          feedTitle   : item.feedTitle,
          feedUrl     : item.feedUrl,
          feedImage   : item.feedImage
        };
      });

      // cache the data
      this.populateStorage('rssFeedsData', JSON.stringify(cacheData));
    }

    return parsedData;
  }

  /**
   * Check if Cache is Stale
   *
   * @param {Array} data data to compare to cache
   * @return {Boolean}
   */
  isCacheStale(data) {
    if (!localStorage.getItem('rssFeedsData')) {
      return true;
    }

    const cachedData = this.getStorage('rssFeedsData');
    const newContentAvailable = data.findIndex((el, index) => {
      return el.pubDate > cachedData[index].pubDate;
    }, this);

    return (newContentAvailable !== -1) ? true : false;
  }

  /**
   * Parse feed data. Save data to Local Storage.
   *
   * @param {String} feed a raw text/xml string
   * @return {XMLDocument} Parsed feed data
   */
  parseFeedData(feed) {
    return this.domParser.parseFromString(feed, 'text/xml');
  }

  /**
   * Get a feed's pubDate
   *
   * @param {XMLDocument} feed DOMParser() parsed string
   * @return {Number|null} Date in milliseconds since Unix epoch
   */
  getFeedPubDate(feed) {
    const item = feed.querySelector('item');
    const pubDate = item.querySelector('pubDate').innerHTML;
    return (pubDate) ? new Date(pubDate).getTime() : null;
  }

  /**
   * Sort feeds in decending order
   *
   * @return {Array} Array of feed data objects
   */
  sortFeedsLatest(data) {
    // this.rssFeedsData.sort((a, b) => b.pubDate - a.pubDate);
    // return this.rssFeedsData;
    return data.sort((a, b) => b.pubDate - a.pubDate);
  }

  /**
   * Get the most recent feed
   *
   * @return {Object} Object of most recent feed data
   */
  getFeedLatest() {
    return this.feedLatest;
  }

  /**
   * Set the most recent feed
   *
   * @return {Object} Object of most recent feed data
   */
  setFeedLatest() {
    this.feedLatest = this.rssFeedsData[0];
    return this.feedLatest;
  }

  /**
   * Show refresh button
   */
  showRefreshButton() {
    this.btnRefresh.classList.add(this.CLASS_BTN_REFRESH_VISIBLE);
    this.btnRefresh.tabIndex = 0;
  }

  /**
   * Hide refresh button
   */
  hideRefreshButton() {
    this.btnRefresh.classList.remove(this.CLASS_BTN_REFRESH_VISIBLE);
    this.btnRefresh.tabIndex = -1;
  }
}

const feeds = new Feeds();
export default feeds;
