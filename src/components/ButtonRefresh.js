import React from 'react';

import { ThemeContext } from '../theme-context';

class ButtonRefresh extends React.Component {
  constructor(props) {
    super(props);

    this.CLASS_BASE = 'btn btn-refresh';
    this.CLASS_VISIBLE = this.CLASS_BASE + ' btn-refresh--visible';

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    this.props.doRefresh(e);
  }

  render() {
    const classes = (this.props.isVisible) ? this.CLASS_VISIBLE : this.CLASS_BASE;
    const theme = 'btn--' + this.context.theme;

    return (
      <button id="btn-refresh" className={theme + ' ' + classes} onClick={this.handleClick}>
        New Content Available. Click to Refresh.
      </button>
    );
  }
}
ButtonRefresh.contextType = ThemeContext; // access within Class with this.context in lifecycle methods

export default ButtonRefresh;
