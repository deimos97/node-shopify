import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import {Layout, EmptyState, Card, Section} from '@shopify/polaris';

const EmptyInstall = ({title, setHeaderTitle}) => {
	return (
		<Card sectioned>
			<EmptyState
				heading="¡La APP está instalada!"
				image="/images/rocket.png"
			>
				<p>Ya tienes una APP base sobre la que poder construir la tuya.</p>
			</EmptyState>
		</Card>
	)
}

export default EmptyInstall