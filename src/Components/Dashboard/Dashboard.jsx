import React, { useCallback, useState, useEffect } from "react";
import Env from '../../Env';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';

import listPlugin from '@fullcalendar/list';
import interactionPlugin from "@fullcalendar/interaction";

import { v4 as uuidv4 } from 'uuid';
import {format} from 'date-fns';

import { Container, Row, Col, Button, Badge, Input } from 'reactstrap';
import './dashboard.css';

//import ShiftCalculator from '../../Logic/ShiftCalculator';
//import ShiftData from '../../Logic/Data/ShiftData.json';

const Dashboard = (props) => {

    /*********** データのセット ************/

    // データのセット
    const [shiftData, setShiftData] = useState();

    
    const [ resourceData, setResourceData ] = useState();
    const [ violateData, setViolateData] = useState()

    const [ eventData, setEventData ] = useState([]);
    const [ eventCalcData, setEventCalcData ] = useState([
	{ id: '1', resourceId: '00000000', title: "人", start: "2022-09-02T00:00:00", end: "2022-09-05T05:00:00" },
    ]);
    
    const findMemberInfo = (member_id) => {
	// 特定のメンバーIDを持つメンバーのデータを取得
	return shiftData.member_data.find(m => {
	    return m.member_id === member_id;
	});
    }

    const makeEventData = (member_id, title, start, end) => {
	// シフトデータをカレンダー表示用のデータに整形
	const member_info = findMemberInfo(member_id);
	return { id: uuidv4(), resourceId: member_id, title: title, start: start, end: end };
	//return { id: Math.floor(Math.random()*1000), resourceId: member_id, title: title, start: start, end: end };
    }
    
    const convertMemberDataToCalendarResource = (member_data) => {
	// メンバーデータをカレンダー表示用のデータに整形
	const resource = [{ id: '0', title: '未定', workedTime: '' }];
	const members = member_data.map(m => {
	    return {
		id: m.member_id,
		resourceId: m.member_id,
		title: m.last_name+m.first_name,
		workedTime: '',
	    }
	});
	const empty_slot = { id: 'unknown', title: ''}; // 最終行の見た目の整形用
	return [...resource, ...members, empty_slot];
    }



    const calcShift = () => {
	// １からシフトをランダム生成

	const new_event_dataset = shiftData.shift_request.map(req => {
	    return req.request.map(req_cal => {
		const dt = new Date(req_cal.date);
		const today = dt.getDate();

		const tomorrow = format(new Date(dt.getFullYear(), dt.getMonth(), today+1), 'yyyy-MM-dd');

		return makeEventData(req.member_id, '出勤可', req_cal.date, tomorrow);
	    })
	});

	const tmp = [];
	const new_d = new_event_dataset.reduce((acc, val) => acc.concat(val), []);
	setEventData(new_d);

	console.log(resourceData)
	//let shift_candidate1 = new ShiftCalculator(ShiftData);
	//console.log(shift_candidate1)
	//console.log(shiftData)
    }
    

    /*********** データの読み込み・書き出し（インポート・エクスポート） **********/
    const importShiftData = (e) => {
	// シフトデータのインポート
	const reader = new FileReader();
	reader.readAsText(e.target.files[0]);
	reader.onload = () => {
	    const result = JSON.parse(reader.result);
	    setResourceData(convertMemberDataToCalendarResource(result.member_data));
	    setViolateData(result.shift_candidate.violations);
	    setShiftData(result);
	}
}


const exportJson = (file_content, file_name) => {
	const json = JSON.stringify(file_content);
	const blob = new Blob([json], { type: 'application/json' });
	const link_dom = document.createElement("a");
	const url =  URL.createObjectURL(blob);
	link_dom.href = url;
	link_dom.download = format(new Date(), 'yyyyMMdd')+'-'+file_name+'.json';
	link_dom.click();
	link_dom.remove();
    }
    
    const gatherShiftData = () => {
	return {
	    shift_request: shiftData.shift_request,
	    member_data: shiftData.member_data,
	    calendar_data: shiftData.calendar_data,
	    shift_candidate: shiftData.shift_candidate
	};
    }
    
    const exportShiftData = () => {
	// シフトデータのエクスポート
	exportJson(gatherShiftData(), 'shift-candidate');
    }

    
    /********* カレンダーのドラッグ＆ドロップなどのイベント処理 ************/
    const updateShiftRequestData = (d) => {
	setEventData(d);	
    }

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

	updateShiftRequestData([newEventData, ...oldEventData]);
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

	let resourceId;
	if(event.newResource === null) {
	    resourceId = updateTargetData.resourceId;
	} else {
	    resourceId = event.newResource.id;
	}
	const newData = { id: id, resourceId: resourceId, title: updateTargetData.title, start: startStr, end: endStr };
	updateShiftRequestData([...keepData, newData]);
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
	updateShiftRequestData([...keepData, newData]);
    }

    const handleRemove = (event) => {
	const id = event.event.id;
	const keepData = eventData.filter((d) => {
	    return d.id !== id;
	});
	updateShiftRequestData(keepData);
    }

    return (
	<Container>
	    <Row>　</Row>
	    <Row className="monthly_calendar">
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
		    resourceAreaWidth="120px"
		    resourceAreaColumns={[{
			field: 'title',
			headerContent: '人員'
		    }, {
			field: 'workedTime',
			headerContent: '総日数'
		    }]}
		    resources={resourceData}
		    aspectRatio="1.5"
		    height="70vh"
		    selectable={true}
		    editable={true}
		    selectMirror={true}
		    select={handleDataSelect}
		    eventDrop={handleDrop}
		    eventResize={handleResize}
		    eventClick={handleRemove}
		/>
	    </Row>
	    <Row className="monthly_calendar assignCount">
		<FullCalendar
		    locale="ja" // 日本語化
		    plugins={[dayGridPlugin, timeGridPlugin, resourceTimelinePlugin, interactionPlugin]}
		    initialView="resourceTimelineMonth"
		    headerToolbar={{
			left: '',
			right: '',
		    }}
		    events={eventCalcData}
		    resourceAreaWidth="120px"
		    resourceAreaColumns={[{
			field: 'title',
			headerContent: 'アサイン人数'
		    }]}
		    resources={[{ resourceId: '0', title: '人数' }]}
		    aspectRatio="1.5"
		    height="10vh"
		    selectable={false}
		    editable={false}
		    selectMirror={false}
		/>
	    </Row>
	    <Row>　</Row>
	    <Row id="temporary_console">
		{/* <Col><p>問題点: {violateData.length !== 0 ? violateData : 'なし'}</p></Col> */}
		<Col className='btn_field'>
		    <Button color='danger' onClick={calcShift}>シフト案のランダム生成開始</Button>
		</Col>
		<Col className='btn_field'>
		    <Row>
			<Col>
			    <form name='shift_json_import'>
				<Button color='primary' size='sm'>
				    <label>シフトデータのインポート</label><br />
				    <Input name='shift_file' type='file'
					   onChange={importShiftData} />
				</Button>
			    </form>
			</Col>
			<Col>
			    <Button className='data_btn' color='success' size='sm' onClick={exportShiftData}>
				シフトデータのエクスポート
			    </Button>
			</Col>
		    </Row>
		</Col>
	    </Row>
	</Container>
    );
};

export default Dashboard;
