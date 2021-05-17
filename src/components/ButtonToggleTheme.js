import React from 'react';

import { ThemeContext } from '../theme-context';

class ButtonToggleTheme extends React.Component {
  render() {
    return (
      <button id="btn-toggle-theme" onClick={this.context.toggleTheme}>
        Toggle Theme
      </button>
    );
  }
}
ButtonToggleTheme.contextType = ThemeContext;

export default ButtonToggleTheme;
