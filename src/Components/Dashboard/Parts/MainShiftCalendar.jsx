import React, { useCallback, useState, useEffect } from "react";
import Env from '../../../Env';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';

import listPlugin from '@fullcalendar/list';
import interactionPlugin from "@fullcalendar/interaction";

import {format} from 'date-fns';

import { Container, Row, Col, Button, Badge, Input } from 'reactstrap';

const MainShiftCalendar = ({eventData, resourceData, handleSelect, handleDrop, handleResize, handleRemove}) => {
    // シフト案を表示するメインのカレンダー

    const dt = new Date();
    const defaultDate = format(new Date(dt.getFullYear(), dt.getMonth()+1, 1), 'yyyy-MM-dd');
    
    return (
	<FullCalendar
	    locale="ja" // 日本語化
	    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, resourceTimelinePlugin]}
	    initialView="resourceTimelineMonth"
	    headerToolbar={{
		left: 'today prev,next',
		left: 'title',
		//right: 'resourceTimelineMonth,timeGridWeek,dayGridMonth',
	    }}
	    events={eventData}
	    resourceAreaWidth="150px"
	    resourceAreaColumns={[{
		field: 'title',
		headerContent: '人員'
	    }, {
		field: 'workedTime',
		headerContent: '総日数'
	    }, {
		field: 'rank',
		headerContent: '職位'
	    }]}
	    resources={resourceData}
	    initialDate={defaultDate}
	    showNonCurrentDates={false}
	    aspectRatio="1.5"
	    height="60vh"
	    selectable={true}
	    editable={true}
	    selectMirror={true}
	    select={handleSelect}
	    eventDrop={handleDrop}
	    eventResize={handleResize}
	    eventClick={handleRemove}
	/>
    );
};

export default MainShiftCalendar;
