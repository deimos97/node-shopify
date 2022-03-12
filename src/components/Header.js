import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import {Link} from 'react-router-dom'

const Header = ({title, setHeaderTitle}) => {
	return (
		<div>
			<p>Puplate this whit about content</p>
			<p>Puplate this whit about content</p>
			<p>Puplate this whit about content</p>
			<p>Puplate this whit about content</p>
		</div>
	)
}


Header.defaultProps = {
	title: 'Task Tracker',
}

Header.propTypes = {
	title: PropTypes.string.isRequired,
}

export default Header