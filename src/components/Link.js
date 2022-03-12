import React from 'react'
import ReactDOM from 'react-dom'
import {Link as RouterLink, Route} from 'react-router-dom'

const Link = ({to, text, path, setPath}) => {
	
	let classNames = "navigation-link";
	if (path === to) {
		classNames += " active";
	}

	return (
		<RouterLink to={to} className={classNames} onClick={()=>setPath(to)}>
			{text}
		</RouterLink>
	)
}

export default Link