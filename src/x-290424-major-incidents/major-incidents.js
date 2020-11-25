import { createCustomElement, actionTypes } from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';
import "../x-290424-major-incidents-item/major-incidents-item"
import { createHttpEffect } from '@servicenow/ui-effect-http';
import "@servicenow/now-toggle";
import { debounce } from 'lodash';


const LOAD_SUCCEEDED = "LOAD_SUCCEEDED"
const LOAD_FAILED = 'LOAD_FAILED'
const LOAD_MAJOR_INCIDENTS = 'LOAD_MAJOR_INCIDENTS'
const ROW_LIMIT_CHANGED = 'ROW_LIMIT_CHANGED'
let LOAD_INCIDENTS_URL = "/api/now/table/incident?sysparm_display_value=true&sysparm_fields=short_description%2Cnumber%2Cassigned_to%2Cstate%2Cpriority%2Csys_updated_on"


const view = (state, { updateState, dispatch }) => {
	const { items } = state;

	var list =
		items.map(item => {
			// Render the sub component!!
			return <x-290424-major-incidents-item item={item}></x-290424-major-incidents-item>
		});

	return (
		<div>
			<h1>P1 Incidents:</h1>
			<p>
				<span className="inline-config">
					Show New Incidents Only: <now-toggle size="md"></now-toggle>
				</span>

				<span className="inline-config">
					Rows Limit:
					<input
						type="textbox" value={state.rowLimit}
						on-input={(e) => {
							updateState({ rowLimit: e.target.value });
							dispatch(ROW_LIMIT_CHANGED);
						}}
					/>
				</span>
			</p>

			<div>{list}</div>
		</div>
	);
};

const loadMajorIncidents = createHttpEffect(
	LOAD_INCIDENTS_URL,
	{
		method: 'GET',
		queryParams: ['sysparm_limit', 'sysparm_query'],
		successActionType: LOAD_SUCCEEDED,
		errorActionType: LOAD_FAILED,
		batch: false
	}
);

const loadSucceded = ({ action, updateState }) => {
	console.log(action.payload, "loadSucceded")
	updateState({ items: action.payload.result });
}

const loadFailed = ({ action, updateState }) => {
	console.log(action.payload, "loadFailed")
}

const showOpenOrInProgressIncidents = (showNewIncidents, rowLimit, dispatch) => {
	if (showNewIncidents === true) {
		// New incidents
		dispatch('LOAD_MAJOR_INCIDENTS', {
			sysparm_limit: rowLimit,
			sysparm_query: 'state=1'
		});
	} else {
		// In Progress incidents
		dispatch('LOAD_MAJOR_INCIDENTS', {
			sysparm_limit: rowLimit,
			sysparm_query: 'state=2'
		});
	}
}

createCustomElement('x-290424-major-incidents', {
	renderer: { type: snabbdom },
	view,
	styles,
	initialState: {
		items: [
		],
		rowLimit: 5,
		newIncidentsOnly: false
	},
	actionHandlers: {
		[actionTypes.COMPONENT_CONNECTED]: ({ dispatch, state }) => {
			dispatch('LOAD_MAJOR_INCIDENTS', {
				sysparm_limit: state.rowLimit,
				sysparm_query: 'state=2'
			});
		},
		[LOAD_MAJOR_INCIDENTS]: loadMajorIncidents,
		[LOAD_SUCCEEDED]: loadSucceded,
		[LOAD_FAILED]: loadFailed,
		["NOW_TOGGLE#CHECKED_SET"]: ({ action, dispatch, state, updateState }) => {
			// Todo: How do we know which checkbox is it if more than one checkbox??
			var isTicked = action.payload.value
			updateState({ newIncidentsOnly: isTicked })
			showOpenOrInProgressIncidents(isTicked, state.rowLimit, dispatch)
		},
		[ROW_LIMIT_CHANGED]: ({ dispatch, state }) => {
			showOpenOrInProgressIncidents(state.newIncidentsOnly, state.rowLimit, dispatch)
		}
		// TODO: Somehow this event is not called, instead using custom dispatch
		// [actionTypes.COMPONENT_PROPERTY_CHANGED]: ({ dispatch, state }) => {
		// 	showOpenOrInProgressIncidents(state.newIncidentsOnly, state.rowLimit, dispatch)
		// }
	}
});
