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
import './shift_request_make.css';


const ShiftRequestMake = (props) => {
    // 各従業員がシフトデータ作成用のインタフェース
    // これで作成したデータを統合したらシフトデータになるっていうイメージ

    const [ shiftData, setShiftData ] = useState([]);
    const [ userData, setUserData ] = useState();
    const [ consultData, setConsultData ] = useState();

    
    const exportJson = (file_content, file_name) => {
	// データの出力
	const json = JSON.stringify(file_content);
	const blob = new Blob([json], { type: 'application/json' });
	const link_dom = document.createElement("a");
	const url =  URL.createObjectURL(blob);
	link_dom.href = url;
	link_dom.download = format(new Date(), 'yyyyMMdd')+'-'+file_name+'.json';
	link_dom.click();
	link_dom.remove();
    }
    
    const gatherShiftRequestData = () => {
	return {
	    person_name: userData,
	    shift_data: shiftData,
	    consult: consultData
	};
    }
    
    const exportShiftData = () => {
	// シフトデータのエクスポート
	exportJson(gatherShiftRequestData(), 'shift-request-'+userData);
    }


    const checkName = (e) => {
	setUserData(e.target.value);
    }

    const checkConsult = (e) => {
	setConsultData(e.target.value);
    }
    
    /********* カレンダーのドラッグ＆ドロップなどのイベント処理 ************/
    const updateShiftRequestData = (d) => {
	setShiftData(d);
    }
    
    const handleDataSelect = (event) => {
	// 作る時
	const id = uuidv4();

	const startStr = event.startStr;
	const endStr = event.endStr;

	const newEventData = { id: id, resourceId: 0, title: "休日希望", start: startStr, end: endStr };
	const oldEventData = shiftData;

	updateShiftRequestData([newEventData, ...oldEventData]);
    }

    const handleDrop = (event) => {
	// 場所移動
	const id = event.event.id;
	const startStr = event.event.startStr;
	const endStr = event.event.endStr

	const keepData = shiftData.filter((d) => {
	    return d.id !== id;
	});
	const updateTargetData = shiftData.filter((d) => {
	    return d.id === id;
	})[0];

	const newData = { id: id, resourceId: 0, title: updateTargetData.title, start: startStr, end: endStr };
	updateShiftRequestData([...keepData, newData]);
    }

    const handleResize = (event) => {
	// サイズかえる時
	const id = event.event.id;
	const startStr = event.event.startStr;
	const endStr = event.event.endStr

	const keepData = shiftData.filter((d) => {
	    return d.id !== id;
	});
	const updateTargetData = shiftData.filter((d) => {
	    return d.id === id;
	})[0];

	const newData = { id: id, resourceId: 0, title: updateTargetData.title, start: startStr, end: endStr };
	updateShiftRequestData([...keepData, newData]);
    }

    const handleRemove = (event) => {
	const id = event.event.id;
	const keepData = shiftData.filter((d) => {
	    return d.id !== id;
	});
	updateShiftRequestData(keepData);
    }

    const dt = new Date();
    const defaultDate = format(new Date(dt.getFullYear(), dt.getMonth()+1, 1), 'yyyy-MM-dd');

    return (
	<Container>
	    <Row>　</Row>
	    <Row><h2>休日希望作成</h2></Row>
	    <Row>　</Row>
	    <Row>
		<form>
		    <label>名前：</label>
		    <Input type="text" name="name" id="nameInput"
			   placeholder="自身の名前を入力してください。（例．田中太郎）"
			   onChange={checkName} />
		</form>
	    </Row>
	    <Row>　</Row>
	    <Row className="rest_request_calendar">
		<FullCalendar
		    locale="ja" // 日本語化
		    plugins={[dayGridPlugin, resourceTimelinePlugin, interactionPlugin]}
		    initialView="dayGridMonth"
		    headerToolbar={{
			center: 'title',
			right: 'today,prev,next',
			left: ''
		    }}
		    events={shiftData}
		    resourceAreaWidth="80px"
		    showNonCurrentDates={false}
		    initialDate={defaultDate}
		    resourceAreaColumns={[{
			field: 'title',
			headerContent: '休日希望'
		    }]}
		    resources={[{ resourceId: 0, title: '' }]}
		    aspectRatio="6.0"
		    height='40vh'
		    selectable={true}
		    editable={true}
		    selectMirror={true}
		    select={handleDataSelect}
		    eventDrop={handleDrop}
		    eventResize={handleResize}
		    eventClick={handleRemove}
		/>
	    </Row>
	    <Row>　</Row>
	    <form>
		<label>その他の連絡事項など：</label>
		<Input type="textarea" name="consult" id="consultInput" placeholder="その他、連絡・相談事項や希望などがあれば入力してください。（例．土日はどちらか１日休みで大丈夫です。）" onChange={checkConsult} />
	    </form>
	    <Row>　</Row>
	    <Row id="temporary_console">
		<Col className='btn_field'>
		    <Row>
			<Col>
			    <Button className='data_btn' color='success' size='sm' onClick={exportShiftData}>
				シフトデータのエクスポート
			    </Button>
			</Col>
			<Col>
			    <u><b>＊操作方法</b></u><br />
			    <ul>
				<li>上部にあなたの名前をフルネームで入力してください。</li>
				<li>休日を希望する日付をクリック、もしくはドラッグアンドドロップをしてください。</li>
				<li>間違えた場合は、削除したい日付の「休日希望」と書かれた青い部分を１回クリックしてください。</li>
				<li>その他、希望や連絡事項があれば、下部に記入してください。</li>
				<li>すべて完了したら、「シフトデータのエクスポート」を押してファイルをダウンロードし、担当者に提出してください。</li>
			    </ul>
			</Col>
		    </Row>
		</Col>
	    </Row>
	</Container>
    );
};

export default ShiftRequestMake;
