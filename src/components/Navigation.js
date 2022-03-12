import React, {useState} from 'react'
import ReactDOM from 'react-dom'
import Link from './Link'

const Navigation = ({title, setHeaderTitle}) => {

	const [path, setPath] = useState(window.location.pathname);

	const linkList = [
		{to: "/", text: "Home"},
		{to: "/about", text: "About"},
	];

	return (
		<div className="navigation-bar">
			{
				linkList.map( ({to, text}, key) =>(
						<Link key={key} to={to} text={text} path={path} setPath={setPath} />		
					)
				)
			}
		</div>
	)
}

export default Navigation