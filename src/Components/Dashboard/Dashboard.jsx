import React, { useCallback, useState, useEffect } from "react";
import Env from '../../Env';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';

import listPlugin from '@fullcalendar/list';
import interactionPlugin from "@fullcalendar/interaction";

import { v4 as uuidv4 } from 'uuid';

import { Container, Row } from 'reactstrap';
import './dashboard.css';

const Dashboard = (props) => {
    const [ eventData, setEventData ] = useState([
	{ id: '1', resourceId: '1', title: "Aさん", start: "2022-09-09T08:00:00", end: "2022-09-09T14:00:00" },
	{ id: '2', resourceId: '1', title: "Aさん", start: "2022-09-05T08:00:00", end: "2022-09-05T10:00:00" },
	{ id: '3', resourceId: '2', title: "Bさん", start: "2022-09-04T10:00:00", end: "2022-09-04T12:00:00" },
	{ id: '4', resourceId: '3', title: "Cさん", start: "2022-09-07T10:00:00", end: "2022-09-07T19:00:00" },
	{ id: '5', resourceId: '3', title: "Cさん", start: "2022-09-09T07:00:00", end: "2022-09-09T13:00:00" }
	]);

    const [ resourceData, setResourcedata ] = useState([
	{ id: '0', title: '未定' },
	{ id: '1', title: 'Aさん', workedTime: 40 },
	{ id: '2', title: 'Bさん', workedTime: 60 },
	{ id: '3', title: 'Cさん', workedTime: 60 },
    ]);
    

    const handleDataSelect = (event) => {
	const id = uuidv4();
	let resourceId;
	if(event.resource === undefined) {
	    // 新しいの作るとき()
	    resourceId = '0';
	    
	} else {
	    resourceId = event.resource._resource.id;
	}
	const startStr = event.startStr;
	const endStr = event.endStr

	const newEventData = { id: id, resourceId: resourceId, title: "新しいシフト", start: startStr, end: endStr };
	const oldEventData = eventData;

	setEventData([newEventData, ...oldEventData]);
    }

    
    const handleDrop = (event) => {
	// 場所移動
	const id = event.event.id;
	const startStr = event.event.startStr;
	const endStr = event.event.endStr

	const keepData = eventData.filter((d) => {
	    return d.id !== id;
	});
	const updateTargetData = eventData.filter((d) => {
	    return d.id === id;
	})[0];

	//console.log(updateTargetData)
	let resourceId;
	if(event.newResource === null) {
	    resourceId = updateTargetData.resourceId;
	} else {
	    resourceId = event.newResource.id;
	}
	const newData = { id: id, resourceId: resourceId, title: updateTargetData.title, start: startStr, end: endStr };
	setEventData([...keepData, newData]);
    }

    const handleResize = (event) => {
	// サイズかえる時
	const id = event.event.id;
	const startStr = event.event.startStr;
	const endStr = event.event.endStr

	const keepData = eventData.filter((d) => {
	    return d.id !== id;
	});
	const updateTargetData = eventData.filter((d) => {
	    return d.id === id;
	})[0];

	let resourceId = updateTargetData.resourceId;
	const newData = { id: id, resourceId: resourceId, title: updateTargetData.title, start: startStr, end: endStr };
	setEventData([...keepData, newData]);

    }


    return (
	<Container>
	    <Row id="monthly_calendar">
		<FullCalendar
		    locale="ja" // 日本語化
		    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, resourceTimelinePlugin]}
		    initialView="resourceTimelineDay"
		    headerToolbar={{
			left: 'today prev,next',
			center: 'title',
			right: 'resourceTimelineDay,timeGridWeek,dayGridMonth',
		    }}
		    events={eventData}
		    resourceAreaWidth="100px"
		    resourceAreaColumns={[{
			field: 'title',
			headerContent: '人員'
		    }, {
			field: 'workedTime',
			headerContent: '今月の労働時間'
		    }]}
		    resources={resourceData}
		    aspectRatio="1.5"
		    height="70vh"
		    allDaySlot={false}
		    selectable={true}
		    editable={true}
		    selectMirror={true}
		    select={handleDataSelect}
		    eventDrop={handleDrop}
		    eventResize={handleResize}
		/>
	    </Row>
	</Container>
    );
};

export default Dashboard;
