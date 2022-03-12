import React, {useState, useCallback} from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter as Router, Route} from 'react-router-dom'
import enTranslations from '@shopify/polaris/locales/en.json';
import {AppProvider, TopBar} from '@shopify/polaris';
import Navigation from './components/Navigation'
import Header from './components/Header'
import EmptyInstall from './components/EmptyInstall'


const App = () => {

	return (
		<Router>

			<Navigation />

			<Route path='/' exact component={EmptyInstall} />
			
			<Route path='/about' exact component={Header} />
				
		</Router>
	)
}

ReactDOM.render(
	<AppProvider i18n={enTranslations}>
		<App />
	</AppProvider>,
	document.getElementById("root")
);
