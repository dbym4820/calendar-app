import React, { useCallback, useState, useEffect } from "react";
import Env from '../../Env';

import { v4 as uuidv4 } from 'uuid';
import {format} from 'date-fns';

import { Container, Row, Col, Button, Badge, Input } from 'reactstrap';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


import './data_gatharing.css';


const DataGatharing = (props) => {
    // 従業員データ一覧を作成するインタフェース
    const [targetYear, setTargetYear] = useState(new Date().getFullYear());
    const [targetMonth, setTargetMonth] = useState(new Date().getMonth() + 2);

    const [filesUploaded, setFilesUploaded] = useState({employee: false, rest_request: false});
    
    const lastDay = new Date(targetYear, targetMonth, 0).getDate();
    const dayList = new Array(lastDay).fill(null).map((_, i) => i + 1);
    const formattedDayList = dayList.map(d => {
	return format(new Date(targetYear, targetMonth-1, d), 'yyyy-MM-dd');
    });
    const cal_data = formattedDayList.map(day => {
	return {
	    date: day,
	    require_min_member_number: 3,
	    require_max_member_number: 4
	}
    });

    const [shiftData, setShiftData] = useState({"shift_candidate": {"shiftCandidate":[], "violation": []}, 'calendar_data': cal_data, 'shift_request': []});
    const [employeeData, setEmployeeData] = useState();
    const [shiftRequestData, setShiftRequestData] = useState();


    
    const [calendarData, setCalendarData] = useState(cal_data);

    const importEmployeeData = (e) => {
	const reader = new FileReader();
	reader.readAsText(e.target.files[0]);
	reader.onload = () => {
	    const result = JSON.parse(reader.result);
	    setEmployeeData(result);
	    setShiftData({...shiftData, 'member_data': result});
	}
	
	setFilesUploaded({employee: true, rest_request: filesUploaded.rest_request})
	if(filesUploaded.rest_request) {
	    translateRestRequestToShiftData()
	}
    }

    const importShiftRequestData = (e) => {
	const result_json = [];
	const uploaded_files = e.target.files;
	for(let i = 0; i < uploaded_files.length; i++) {
	    const reader = new FileReader();
	    reader.readAsText(uploaded_files[i]);
	    reader.onload = () => {
		const result = JSON.parse(reader.result);
		result_json.push(result);
	    }
	}
	setShiftRequestData(result_json);

	setFilesUploaded({employee: filesUploaded.employee, rest_request: true})
	if(filesUploaded.employee) {
	    translateRestRequestToShiftData();
	}
    }

    const checkDayAvailability = (shift_request, member_id, date) => {
	const targetDate = new Date(date);
	const sr = shift_request.map(req => {
	    const startDate = new Date(req.start);
	    const endDate = new Date(req.end);
	    const isRestRequest = targetDate >= startDate && targetDate <= endDate;
	    return isRestRequest;
	});
	return sr.find(d => d===true) !== undefined ? 'ng' : 'ok';
	// 休みに当てはまっている部分が１つでもあれば真（休み希望＝＞ng）を返す
    }
    const translateRestRequestToShiftData = () => {
	if(filesUploaded.rest_request && filesUploaded.employee) {
	    // 「休み希望」のデータを「出勤可能日」のデータに変換して，シフト生成に用いるデータに整形して保存
	    const member_request_data = shiftRequestData.map(req => {
		const member_info = shiftData.member_data.find(m => {
		    return m.last_name+m.first_name === req.person_name;
		});
		return {
		    member_id: member_info.member_id,
		    consult: req.consult,
		    request: formattedDayList.map(day => {
			return {
			    date: day,
			    ok_ng: checkDayAvailability(req.shift_data, member_info.member_id, day)
			}
		    })
		}
	    });
	    
	    setShiftData({...shiftData, 'shift_request': member_request_data});
	}
    }


    const dataUpdate = (event, date, min_or_max) => {
	const targetDate = calendarData.find(day => {
	    return day.date === date
	});
	const targetIndex = calendarData.indexOf(targetDate);
	const keepDateHead = calendarData.slice(0, targetIndex);
	const keepDateTail = calendarData.slice(targetIndex+1);
	targetDate[min_or_max] = event.target.value;
	const new_calendar_data = [ ...keepDateHead, targetDate, ...keepDateTail ];
	setCalendarData(new_calendar_data);
	setShiftData({...shiftData, 'calendar_data': new_calendar_data});
    }
    
    
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
    
    const exportShiftData = () => {
	new Promise(() => {
	    translateRestRequestToShiftData();
	});
	exportJson(shiftData, 'shift-data');

    }

    return (
	<Container>
	    <Row>　</Row>
	    <Row><h2>休日希望データの統合処理：{targetYear}年 {targetMonth}月分のシフトデータ生成</h2></Row>
	    <Row>　</Row>
	    <Row>
		<form>
		    <TableContainer component={Paper} className='calendar_table'>
			<Table aria-label="calendar table">
			    <TableHead>
				<TableRow>
				    <TableCell align="center">日付</TableCell>
				    <TableCell align="center">最少人数</TableCell>
				    <TableCell align="center">最大人数</TableCell>
				</TableRow>
			    </TableHead>
			    <TableBody>
				{
				    calendarData.map(day => (
					<TableRow key={day.date}>
					    <TableCell align="center">{day.date}</TableCell>
					    <TableCell align="center">
						<Input type='number' value={day.require_min_member_number}
						       onChange={(e) => {dataUpdate(e, day.date, 'require_min_member_number')}} />
					    </TableCell>
					    <TableCell align='center'>
						<Input type='number' value={day.require_max_member_number}
						       onChange={(e) => {dataUpdate(e, day.date, 'require_max_member_number')}} />
					    </TableCell>
					</TableRow>
				    ))
				}
			    </TableBody>
			</Table>
		    </TableContainer>
		</form>
	    </Row>
	    <Row>　</Row>
	    <Row id="temporary_console">
		<Col className='btn_field'>
		    <Row>
			<Col>
			    <form name='employee_json_import'>
				<Button color='primary' size='sm'>
				    <label>職員データのインポート</label><br />
				    <Input name='employee_file' type='file'
					   onChange={importEmployeeData} />
				</Button>
			    </form>
			</Col>
			<Col>
			    <form name='shift_request_json_import'>
				<Button color='primary' size='sm'>
				    <label>休日希望データのインポート</label><br />
				    <Input name='shift_request_file' type='file' multiple
					   onChange={importShiftRequestData} />
				</Button>
			    </form>
			</Col>
		    </Row>
		    <Row>　</Row>
		    <Row>　</Row>
		    <Row>
			<Col>
			    <Button className='data_btn' color='success' size='sm'
				    onClick={exportShiftData}>
				シフト生成用基礎データのエクスポート
			    </Button>
			</Col>
			<Col>
			    <u><b>＊操作方法</b></u>
			    <ul>
				<li>職員データ・休日希望データをアップロードの上、各日の必要要員数を設定して、データをエクスポートしてください。</li>
			    </ul>
			</Col>
		    </Row>
		</Col>
	    </Row>
	</Container>
    );
};

export default DataGatharing;
