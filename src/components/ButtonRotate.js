import React from 'react';

import { ThemeContext } from '../theme-context';

class ButtonRotate extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    this.props.doRotate(e);
  }

  render() {
    return(
      <button id="btn-rotate" className={'btn' + ' btn--' + this.context.theme} onClick={this.handleClick}>
        Rotate
      </button>
    );
  }
}
ButtonRotate.contextType = ThemeContext;

export default ButtonRotate;
