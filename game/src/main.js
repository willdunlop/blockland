
/* Three dependencies */
import Core from './core'

/* UI Dependencies */
import React from 'react';
import ReactDOM from 'react-dom';

import App from './interface/app';


/**
 * Probably dont have to append App to window.
 * Can look at simply calling upon it if we don't want app information to be public
 * */
const core = new Core();

ReactDOM.render(<App core={core} />, document.getElementById('ui'));
