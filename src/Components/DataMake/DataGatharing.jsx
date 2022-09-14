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

    const [filesUploaded, setFilesUploaded] = useState({employee_uploaded: false,
							rest_request_uploaded: false,
							generate_shift_file: false});
    const getFormattedDayList = () => {
	const lastDay = new Date(targetYear, targetMonth, 0).getDate();
	const dayList = new Array(lastDay).fill(null).map((_, i) => i + 1);
	return dayList.map(d => {
	    return format(new Date(targetYear, targetMonth-1, d), 'yyyy-MM-dd');
	});
    }
    
    const [shiftData, setShiftData] = useState(
	{
	    shift_candidate:
	    {
		shift_candidate:[],
		violation: []
	    },
	    member_data: [],
	    calendar_data: getFormattedDayList().map(day => {
		return {
		    date: day,
		    require_min_member_number: 3,
		    require_max_member_number: 4
		}
	    }),
	    shift_request: [],
	    rest_request: []
	}
    );

    const importEmployeeData = (e) => {
	const member_data = [];
	const reader = new FileReader();
	reader.readAsText(e.target.files[0]);
	reader.onload = () => {
	    const member_data_tmp = JSON.parse(reader.result);
	    member_data.push(...member_data_tmp);
	}

	setFilesUploaded((prev) => ({...prev, employee_uploaded: true})); // ファイルをアップロード済みに
	setShiftData((prev) => ({...prev, member_data: member_data}));
	    // 休み希望を出勤希望に	
    }

    const importShiftRequestData = (e) => {
	const rest_request = [];
	const uploaded_files = e.target.files;
	for(let i = 0; i < uploaded_files.length; i++) {
	    const reader = new FileReader();
	    reader.readAsText(uploaded_files[i]);
	    reader.onload = () => {
		const result = JSON.parse(reader.result);
		rest_request.push(result);
	    }
	}

	setFilesUploaded((prev) => ({...prev, rest_request_uploaded: true})); // ファイルをアップロード済みに
	setShiftData((prev) => ({...prev, rest_request: rest_request})); // 休み希望を出勤希望データに
    }


    const translateRestRequestToShiftData = (rest_request, member_data) => {
	// 「休み希望」のデータを「出勤可能日」のデータに変換して，シフト生成に用いるデータに整形して保存
	const checkDayAvailability = (rest_req, member_id, date) => {
	    const targetDate = new Date(date);
	    const rr = rest_req.map(req => {
		const startDate = new Date(req.start);
		const endDate = new Date(req.end);
		const isRestRequest = targetDate >= startDate && targetDate < endDate;
		return isRestRequest ? true : false;
	    });
	    return rr.indexOf(true) !== -1 ? 'ng' : 'ok';
	    // 休みに当てはまっている部分が１つでもあれば真（休み希望＝＞ng）を返す
	}

	const shift_request = rest_request.map(req => {
	    const member_info = member_data.find(m => {
		return m.last_name+m.first_name === req.person_name;
	    });
	    return {
		member_id: member_info.member_id,
		consult: req.consult,
		request: getFormattedDayList().map(day => {
		    return {
			date: day,
			ok_ng: checkDayAvailability(req.shift_data, member_info.member_id, day)
		    }
		})
	    }
	});
	return shift_request;
    }
    


    const dataUpdate = (event, date, min_or_max) => {
	const targetDate = shiftData.calendar_data.find(day => {
	    return day.date === date
	});
	const targetIndex = shiftData.calendar_data.indexOf(targetDate);
	const keepDateHead = shiftData.calendar_data.slice(0, targetIndex);
	const keepDateTail = shiftData.calendar_data.slice(targetIndex+1);
	targetDate[min_or_max] = event.target.value;
	const calendar_data = [ ...keepDateHead, targetDate, ...keepDateTail ];
	setShiftData((prev) => ({...prev, calendar_data}));
    }


    const generateShiftFile = (event) => {
	setShiftData((prev) => ({
	    ...prev, shift_request: translateRestRequestToShiftData(shiftData.rest_request, shiftData.member_data)
	}));
	
	setFilesUploaded((prev) => ({ ...prev, generate_shift_file: true }));
    }
    
    const exportShiftData = () => {
	// データの出力
	const json = JSON.stringify(shiftData);
	const blob = new Blob([json], { type: 'application/json' });
	const link_dom = document.createElement("a");
	const url =  URL.createObjectURL(blob);
	link_dom.href = url;
	link_dom.download = format(new Date(), 'yyyyMMdd')+'-shift-data.json';
	link_dom.click();
	link_dom.remove();
    }

    return (
	<Container>
	    <Row>　</Row>
	    <Row><h2>休日希望データの統合処理：{targetYear}年 {targetMonth}月分のシフトデータ生成</h2></Row>
	    <Row>　</Row>
	    <Row>
		<Col>
		    <form>
			<TableContainer component={Paper} className='employee_calendar_table'>
			    <Table aria-label="calendar table">
				<TableHead>
				    <TableRow>
					<TableCell align="center">日付</TableCell>
					<TableCell align="left">最少人数</TableCell>
					<TableCell align="left">最大人数</TableCell>
				    </TableRow>
				</TableHead>
				<TableBody>
				    {
					shiftData.calendar_data.map(day => (
					    <TableRow key={day.date}>
						<TableCell align="center">{day.date}</TableCell>
						<TableCell align="center">
						    <Input className='minimal_number_input'
							   type='number' value={day.require_min_member_number}
							   onChange={(e) => dataUpdate(e, day.date, 'require_min_member_number')} />
						</TableCell>
						<TableCell align='center'>
						    <Input className='max_number_input'
							   type='number' value={day.require_max_member_number}
							   onChange={(e) => dataUpdate(e, day.date, 'require_max_member_number')} />
						</TableCell>
					    </TableRow>
					))
				    }
				</TableBody>
			    </Table>
			</TableContainer>
		    </form>
		</Col>
		<Col className='btn_field'>
		    <Row>　</Row>
		    <Row>
			<Col>
			    <u><b>＊操作方法</b></u>
			    <ul>
				<li>職員データ・休日希望データをアップロードの上、各日の必要要員数を設定して、データをエクスポートしてください。</li>
			    </ul>
			</Col>
		    </Row>

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
		    </Row>
		    <Row>　</Row>
		    <Row>
			<Col>
			    <form name='shift_request_json_import'>
				<Button color='primary'
					size='sm'>
				    <label>休日希望データのインポート</label><br />
				    <Input name='shift_request_file' type='file' multiple
					   onChange={importShiftRequestData} />
				</Button>
			    </form>
			</Col>
		    </Row>
		    <Row>　</Row>
		    <Row>
			<Button className='shift_export_btn' size='lg'
				color={filesUploaded.employee_uploaded &&
				   filesUploaded.rest_request_uploaded ?
					       'info' : 'secondary' }
				onClick={(e) => {
				    filesUploaded.employee_uploaded &&
					filesUploaded.rest_request_uploaded ?
					generateShiftFile(e) : alert('先にファイルをアップロードしてください。')
				}}>
			    シフト生成用基礎データの生成
			</Button>
		    </Row>
		    <Row>　</Row>
		    <Row>
			<Button className='shift_export_btn' size='lg'
				color={filesUploaded.generate_shift_file ?
					       'success' : 'secondary' }
				onClick={(e) => {
				    filesUploaded.generate_shift_file ?
					exportShiftData(e) : alert('先にシフトファイルを生成してください。')
				}}>
			    シフト生成用基礎データのエクスポート
			</Button>
		    </Row>
		</Col>
	    </Row>
	</Container>
    );
};

export default DataGatharing;
