
import React from "react";
import { hot } from 'react-hot-loader/root';

// components
import FeedSections from './components/FeedSections';

import { theme, ThemeContext } from './theme-context';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.toggleTheme = this.toggleTheme.bind(this);

    // State also contains the updater function so it will
    // be passed down into the context provider
    this.state = {
      theme: theme.theme,
      toggleTheme: this.toggleTheme
    };

  }

  toggleTheme() {
    this.setState((prevState) => ({
      theme: (prevState.theme === 'light') ? 'dark' : 'light'
    }));
  }

  render() {
    // The entire state is passed to the provider
    return (
      <ThemeContext.Provider value={this.state}>
        <FeedSections />
      </ThemeContext.Provider>
    );
  }
}

export default hot(App);
