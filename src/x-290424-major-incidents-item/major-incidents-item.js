import { createCustomElement } from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';
import '@servicenow/now-card'
import "@servicenow/now-template-card"

const view = (state, { updateState }) => {
	const { item } = state;

	return (
		<div>
			<now-template-card-assist
				// tagline={{ "icon": "tree-view-long-outline", "label": "Process" }}
				//actions={[{ "id": "share", "label": "Copy URL" }, { "id": "close", "label": "Mark Complete" }]}
				heading={{ "label": item.short_description }}
				content={[
					{ "label": "State", "value": { "type": "string", "value": item.state } },
					{ "label": "Assigned", "value": { "type": "string", "value": item.assigned_to.display_value ? item.assigned_to.display_value : '' } },
					{ "label": "Priority", "value": { "type": "string", "value": item.priority } },
					{ "label": "Number", "value": { "type": "string", "value": item.number } }
				]}
				contentItemMinWidth="300"
				footerContent={{ "label": "Updated:", "value": item.sys_updated_on }}
				configAria={{}}>

			</now-template-card-assist>
		</div>
	);
};

createCustomElement('x-290424-major-incidents-item', {
	renderer: { type: snabbdom },
	view,
	styles,
	properties: {
		item: {
			default: {}
		}
	},
	// This is to map the properties to state
	transformState: ({ properties }) => properties,
});
