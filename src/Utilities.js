import sanitizeHtml from 'sanitize-html';

class Utilities {

  /**
   * Make a POST request using Fetch
   *
   * @param {String} url the url
   * @param {Object} data the data to POST
   * @param {Boolean} text true for Response.text() | false for Response.json()
   * @return {Object} Promise object
   */
  static async postData(url = '', data = {}, text = true) {
    const response = await fetch(url, {
      method: 'POST',
      // mode: 'cors',
      // mode: 'same-origin',
      // cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
      },
      body: this.buildQuery(data)
    });

    return (text) ? await response.text() : await response.json();
  };

  /**
   * Make a GET request using Fetch
   *
   * @param {String} url the url
   * @param {Object} data the data to GET
   * @return {Object} Promise object
   */
  static async getData(url = '', data = {}, text = false) {
    // const _url = url + '?' + this.buildQuery(data);
    // const response = await fetch(url, {
    //   method: 'GET',
    //   mode: 'cors', // no-cors, *cors, same-origin
    //   cache: 'default', // *default, no-cache, reload, force-cache, only-if-cached
    //   credentials: 'same-origin', // include, *same-origin, omit
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   redirect: 'follow', // manual, *follow, error
    //   referrerPolicy: 'no-referrer' // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    // });

    // Express Route Parameters
    // const _url = url + encodeURIComponent(data.url);
    // Express Query String
    const _url = url + '?' + this.buildQuery(data);
    const response = await fetch(_url);

    return (text) ? await response.text() : await response.json();
  };

  /**
   * Build a query string from on input object
   *
   * @param {Object} data key-value pairs to transform into a string
   * @return {String} query formated string
   */
  static buildQuery(data) {
    if (typeof data === 'string') return data;

    const query = [];

    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
      }
    }

    return query.join('&');
  };

  /**
   * Removes <![CDATA[ ]]> tags from a string
   *
   * @param {String} string
   * @return {String} sanitized string
   */
  static removeCDATA(string) {
    return sanitizeHtml(string.replace('<![CDATA[', '').replace(']]>', ''));
  }

  /**
   * Truncates a string to the specified length. Optionally adds a trailing ellipsis
   *
   * @param {String} string the input string
   * @param {String} length character length to truncate the input string to
   * @param {Boolean} ellipsis true to append an ellipsis
   * @return {String} Truncated string
   */
  static truncateString(string, length = 280, ellipsis = true) {
    let str = string.substring(0, length);
    return (ellipsis) ? str += '...' : str;
  }

  static empty(node) {
    while (node.hasChildNodes()) {
      node.removeChild(node.lastChild);
    }
  }

}

export default Utilities;
