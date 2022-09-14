import React, { useCallback, useState, useEffect } from "react";
import Env from '../../../Env';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';

import listPlugin from '@fullcalendar/list';
import interactionPlugin from "@fullcalendar/interaction";

import {format} from 'date-fns';

const AssignInfoCalendar = ({assignedNumberData}) => {
    // シフト案を表示するメインのカレンダー
    
    const dt = new Date();
    const defaultDate = format(new Date(dt.getFullYear(), dt.getMonth()+1, 1), 'yyyy-MM-dd');
    
    return (
	<FullCalendar
	    locale="ja" // 日本語化
	    plugins={[dayGridPlugin, timeGridPlugin, resourceTimelinePlugin, interactionPlugin]}
	    initialView="resourceTimelineMonth"
	    headerToolbar={{
		left: '',
		right: '',
	    }}
	    events={assignedNumberData}
	    resourceAreaWidth="150px"
	    resourceAreaColumns={[{
		field: 'title',
		headerContent: 'アサイン人数'
	    }]}
	    resources={[{ resourceId: 'all_num', title: '総人数' },
			{ resourceId: 'manager_num', title: 'マネージャー'},
			{ resourceId: 'r_member_num', title: '正社員'},
			{ resourceId: 'parttime_member_num', title: 'パートタイム'},
			{ resourceId: 'daily_report_num', title: '日報'},
			{ resourceId: 'conduct_num', title: '指示'},
			{ resourceId: 'jacket', title: '加工'},
		       ]}
	    aspectRatio="1.5"
	    height="20vh"
	    selectable={false}
	    editable={false}
	    selectMirror={false}
	/>
    );
};

export default AssignInfoCalendar;
