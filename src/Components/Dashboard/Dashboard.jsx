import React, { useCallback, useState, useEffect } from "react";
import Env from '../../Env';
import SelfUtilities from '../../SelfUtilities';

import { v4 as uuidv4 } from 'uuid';
import {format} from 'date-fns';

import { Container, Row, Col, Button, Badge, Input } from 'reactstrap';
import './dashboard.css';

import MainShiftCalendar from './Parts/MainShiftCalendar';
import AssignInfoCalendar from './Parts/AssignInfoCalendar';
import ImportButton from '../SharedComponents/ImportButton';

import ShiftCalculator from '../../Logic/ShiftCalculator';
//import ShiftData from '../../Logic/Data/ShiftData.json';

const Dashboard = (props) => {

    /*********** データのセット ************/
    const [shiftData, setShiftData] = useState({});
    const [shiftFileUploaded, setShiftFileUploaded] = useState({ uploaded: false, reflected: false });
    
    const [ resourceData, setResourceData ] = useState([]);
    const [ eventData, setEventData ] = useState([]);
    const [ assignedNumberData, setAssignedNumberData ] = useState([
	    { id: '1', resourceId: '00000000', title: "人", start: "2022-09-02T00:00:00", end: "2022-09-05T05:00:00" },
    ]); // 人数データ

    /*********** データの抽出・整形 ************/
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
	    const transRank = (rank) => {
	        const rank_data = {
		        'manager' : 'マネージャー',
		        'r_member': '社員',
		        'parttime_member': 'パートタイム'
	        };
	        return rank_data[rank];
	    }

	    const members = member_data.map(m => {
	        return {
		        id: m.member_id,
		        resourceId: m.member_id,
		        title: m.last_name+m.first_name,
		        workedTime: '',
		        rank: transRank(m.rank),
	        }
	    });
	    const empty_slot = { id: 'unknown', title: ''}; // 最終行の見た目の整形用
	    return [...resource, ...members, empty_slot];
    }

    const convertShiftRequestDataToCalendarEvent = (shift_request) => {
	    // シフト希望データをカレンダーに表示するように整形
	    const formatted_shift_data = shift_request.map(req => {
	        return req.request.filter(r => {
		        return r.ok_ng === 'ng';
	        }).map(req_cal => {
		        const dt = new Date(req_cal.date);
		        const today = dt.getDate();
		        const tomorrow = format(new Date(dt.getFullYear(), dt.getMonth(), today+1), 'yyyy-MM-dd');
		        
		        return makeEventData(req.member_id, '', req_cal.date, tomorrow);
	        })
	    });
	    
	    return formatted_shift_data.reduce((acc, val) => acc.concat(val), []);
    }

    /*********** データの読み込み・書き出し（インポート・エクスポート） **********/
    const importShiftData = (e) => {
	    // シフトデータのインポート
	    const reader = new FileReader();
	    reader.readAsText(e.target.files[0]);
	    reader.onload = () => {
	        const result = JSON.parse(reader.result);
	        setShiftData(result);
	    }
	    setShiftFileUploaded((prev) => ({...prev, uploaded: true}));
    }

    const reflectShiftData = (e) => {
	    setResourceData(convertMemberDataToCalendarResource(shiftData.member_data));
	    setEventData(convertShiftRequestDataToCalendarEvent(shiftData.shift_request))
	    setShiftFileUploaded((prev) => ({...prev, reflected: true}));
    }
    
    const exportShiftData = () => {
	    // シフトデータのエクスポート
	    SelfUtilities.exportJsonFile(shiftData, 'shift-candidate');	
    }

    
    /********* カレンダーのドラッグ＆ドロップなどのイベント処理 ************/
    const updateShiftRequestData = (d) => {
	    setEventData(d);
	    updateShift(d);
    }

    const updateShift = (d) => {
	    //
	    const member_event = shiftData.member_data.map(member => {
	        return { member_id: member.member_id, date: d.filter(d => d.resourceId === member.member_id) };
	    })
	    const checkMemberEventExist = (member_id, date) => {
	        const event_data = member_event.find(event => event.member_id === member_id).date.map(day => {
		        return day.start
	        });
	        return event_data.includes(date);
	    }
	    const shift_request = shiftData.shift_request.map(member_request => {
	        return {
		        member_id: member_request.member_id,
		        request: member_request.request.map(req => {
		            return {date: req.date, ok_ng: checkMemberEventExist(member_request.member_id, req.date) ? 'ng' : 'ok'}
		        })
	        }
	    })
	    setShiftData((prev) => ({...prev, shift_request: shift_request}));
    }

    const divideContinueShift = (resource_id, title, start, end) => {
	    // DnDで作られた連続日程のシフトを1日毎のものに分割（処理の簡易化のため）
	    const start_date = new Date(start).getDate();
	    const end_date = new Date(end).getDate()-1;
	    const getAfterDate = (date, days) => {
	        const d = new Date(date);
	        const year = d.getFullYear();
	        const month = d.getMonth();
	        const next_day = d.getDate()+days;
	        return format(new Date(year, month, next_day), 'yyyy-MM-dd');
	    }
	    const generateSingleEventData = (resource_id, title, start, end) => {
	        return { id: uuidv4(), resourceId: resource_id, title: title, start: start, end: end };
	    }
	    const data_set = [];
	    for(let i=0; i<=end_date-start_date; i++) {
	        data_set.push(generateSingleEventData(resource_id, title, getAfterDate(start, i), getAfterDate(start, i+1)));
	    }

	    return data_set;
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

	    const new_event_data = divideContinueShift(resourceId, '', startStr, endStr);
	    const old_event_data = eventData;

	    updateShiftRequestData([...new_event_data, ...old_event_data]);
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
	    const newData = divideContinueShift(resourceId, updateTargetData.title, startStr, endStr );
	    updateShiftRequestData([...keepData, ...newData]);
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
	    const newData = divideContinueShift(resourceId, updateTargetData.title, startStr, endStr);
	    updateShiftRequestData([...keepData, ...newData]);
    }

    const handleRemove = (event) => {
	    const id = event.event.id;
	    const keepData = eventData.filter((d) => {
	        return d.id !== id;
	    });
	    updateShiftRequestData(keepData);
    }


    /*********** その他の演算 ************/
    const calcShift = () => {
	    // シフトをランダム生成
	    const shift_request = shiftData;
	    const shift_candidate = ShiftCalculator(shift_request);
	    if(shift_candidate !== null) {
	        setShiftData((prev) => ({...prev, shift_candidate: shift_candidate}));

	        const isWorkOnADay = (date, member_id) => {
		        const day_workers = shift_candidate.shift_candidate.find(d => d.date===date);
		        return day_workers.working_candidate_member_ids.includes(member_id);
	        }
	        const new_shift_request_dammy = shiftData.shift_request.map(member => {
		        return {
		            member_id: member.member_id,
		            request: member.request.map(day => {
			            return { date: day.date, ok_ng: isWorkOnADay(day.date, member.member_id) ? 'ok' : 'ng' }
		            })
		        }
	        })
	        const new_event = convertShiftRequestDataToCalendarEvent(new_shift_request_dammy);
	        setShiftData((prev) => ({...prev, shift_request: new_shift_request_dammy}));
	        setEventData(new_event);
	    } else {
	        alert('制約を満たすシフトを時間内に組めませんでした。')
	    }
    }
    
    return (
	    <Container>
	        <Row>　</Row>
	        <Row className="monthly_calendar">
		        <MainShiftCalendar
		            eventData={eventData}
		            resourceData={resourceData}
		            handleSelect={handleDataSelect}
		            handleDrop={handleDrop}
		            handleResize={handleResize}
		            handleRemove={handleRemove}
		        />		
	        </Row>
	        <Row className="monthly_calendar assignCount">
		        <AssignInfoCalendar
		            assignedNumber={assignedNumberData}
		        />
	        </Row>
	        <Row>　</Row>
	        <Row id="temporary_console">
		        {/* <Col><p>問題点: {violateData.length !== 0 ? violateData : 'なし'}</p></Col> */}
		        <Col className='btn_field'>
		            <ImportButton
			            label='シフトデータのインポート'
			            handleImportFile={importShiftData}
		            />
		        </Col>
		        <Col className='btn_field'>
		            <Button color={shiftFileUploaded.uploaded ? 'info' : 'secondary'}  size='lg'
			                onClick={(e) => {
				                shiftFileUploaded.uploaded ? 
				                    reflectShiftData(e) : alert('先にファイルをインポートしてください。')
			                }}>インポートしたシフトデータを反映</Button>
		        </Col>
		        <Col className='btn_field'>
		            <Row>
			            <Col>
			                <Button color='danger' onClick={calcShift}>シフト案のランダム生成開始</Button>
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
