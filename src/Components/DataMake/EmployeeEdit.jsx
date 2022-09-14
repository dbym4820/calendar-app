import React, { useCallback, useState, useEffect } from "react";
import Env from '../../Env';

import { v4 as uuidv4 } from 'uuid';
import {format} from 'date-fns';

import { Container, Row, Col, Button, Badge, Input } from 'reactstrap';
import './employee_edit.css';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const EmployeeEdit = (props) => {
    // 職員データの一覧を表示・編集するインタフェース
    
    const createEmployee = (member_id, last_name, first_name, rank, leader, daily_report, conduct, machine, jacket) => {
	return {
	    member_id: member_id, last_name: last_name, first_name: first_name, rank: rank,
	    // 以下，職能
	    ability: {
		leader: leader, daily_report: daily_report, conduct: conduct, machine: machine, jacket: jacket
	    }
	};
    }
    
    const [ employeeData, setEmployeeData ] = useState([]);
    
    const createNewEmployeeData = () => {
	return createEmployee(uuidv4(), '', '', 'parttime_member', 'ok', 'ok', 'ok', 'ok', 'ok');
    }
    
    const addEmployee = () => {
	setEmployeeData(prev => ([...prev, createNewEmployeeData()]));
    }

    const dataUpdate = (e, employee_member_id, updated_data_type) => {
	if(['leader', 'daily_report', 'conduct', 'machine', 'jacket'].includes(updated_data_type)) {
	    const targetEmployee = employeeData.find(emp => emp.member_id === employee_member_id);
	    const targetIndex = employeeData.indexOf(targetEmployee);
	    const keepEmployeesHead = employeeData.slice(0, targetIndex);
	    const keepEmployeesTail = employeeData.slice(targetIndex+1);
		
	    targetEmployee.ability[updated_data_type] = e.target.checked ? 'ok' : 'ng';
	    setEmployeeData([ ...keepEmployeesHead, targetEmployee, ...keepEmployeesTail ]);
	} else if(['last_name', 'first_name', 'rank'].includes(updated_data_type)) {
	    const targetEmployee = employeeData.find(emp => emp.member_id === employee_member_id);
	    const targetIndex = employeeData.indexOf(targetEmployee);
	    const keepEmployeesHead = employeeData.slice(0, targetIndex);
	    const keepEmployeesTail = employeeData.slice(targetIndex+1);
		
	    targetEmployee[updated_data_type] = e.target.value;
	    setEmployeeData([ ...keepEmployeesHead, targetEmployee, ...keepEmployeesTail ]);
	}
    }

    const handleRemove = (member_id) => {
	setEmployeeData(employeeData.filter(emp => emp.member_id !== member_id));
    }

    /********** データの保存 *********/
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
    
    const exportEmployeeData = () => {
	// 職員データのエクスポート
	exportJson(employeeData, 'employees');
    }


    const importEmployeeData = (e) => {
	// 職員データのインポート		
	const reader = new FileReader();
	reader.readAsText(e.target.files[0]);
	reader.onload = () => {
	    setEmployeeData(JSON.parse(reader.result));
	}
    }


    return (
	<Container>
	    <Row>　</Row>
	    <Row><h2>職員データ作成</h2></Row>
	    <Row>{'　'}</Row>
	    <Row>
		<form>
		    <TableContainer component={Paper} className='employee_table'>
			<Table aria-label="employee table">
			    <TableHead>
				<TableRow>
				    <TableCell align="left" colSpan={1}>データ</TableCell>

				    <TableCell align="left" colSpan={4}>職員基本データ</TableCell>
				    <TableCell align="left" colSpan={5}>職能</TableCell>
				</TableRow>
				<TableRow>
				    <TableCell align="center">削除</TableCell>
				    <TableCell align="center">職員ID</TableCell>
				    <TableCell align="center">職員名（姓）</TableCell>
				    <TableCell align="center">職員名（名）</TableCell>
				    <TableCell align="center">職位</TableCell>
				    <TableCell align="center">リーダー</TableCell>
				    <TableCell align="center">日報</TableCell>
				    <TableCell align="center">指示</TableCell>
				    <TableCell align="center">ミシン</TableCell>
				    <TableCell align="center">ジャケット加工</TableCell>
				</TableRow>
			    </TableHead>
			    <TableBody>
				{employeeData.map((employee) => (
				    <TableRow key={employee.member_id}>
					<TableCell align="center">
					    <Button onClick={() => handleRemove(employee.member_id)}>×</Button>
					</TableCell>
					<TableCell align="center">{employee.member_id}</TableCell>
					<TableCell align="center">
					    <Input type='text' value={employee.last_name} placeholder='田中'
						   onChange={(e) => {dataUpdate(e, employee.member_id, 'last_name')}} />
					</TableCell>
					<TableCell align='center'>
					    <Input type='text' value={employee.first_name} placeholder='太郎'
						   onChange={(e) => {dataUpdate(e, employee.member_id, 'first_name')}} />
					</TableCell>
					<TableCell align="center">
					    <Input type='select' value={employee.rank}
						   onChange={(e) => {dataUpdate(e, employee.member_id, 'rank')}}>
						<option value='manager'>マネージャー</option>
						<option value='r_member'>正社員</option>
						<option value='parttime_member'>パートタイム職員</option>
					    </Input>
					</TableCell>
					<TableCell align="center">
					    <Input type='checkbox' checked={employee.ability.leader === 'ok'}
						   onChange={(e) => {dataUpdate(e, employee.member_id, 'leader')}} />
					</TableCell>
					<TableCell align="center">
					    <Input type='checkbox' checked={employee.ability.daily_report === 'ok'}
						   onChange={(e) => {dataUpdate(e, employee.member_id, 'daily_report')}} />
					</TableCell>
					<TableCell align="center">
					    <Input type='checkbox' checked={employee.ability.conduct === 'ok'}
						   onChange={(e) => {dataUpdate(e, employee.member_id, 'conduct')}} />
					</TableCell>
					<TableCell align="center">
					    <Input type='checkbox' checked={employee.ability.machine === 'ok'}
						   onChange={(e) => {dataUpdate(e, employee.member_id, 'machine')}} />
					</TableCell>
					<TableCell align="center">
					    <Input type='checkbox' checked={employee.ability.jacket === 'ok'}
						   onChange={(e) => {dataUpdate(e, employee.member_id, 'jacket')}} />
					</TableCell>
				    </TableRow>
				))}
				<TableRow key='new_employee'>
				    <TableCell align="center" colSpan={8}>
					<Button color='success' onClick={addEmployee}>
					    +
					</Button>
				    </TableCell>
				</TableRow>

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
			    <form name='json_import'>
				<Button color='primary' size='sm'>
				    <label>職員データのインポート</label><br />
				    <Input name='import_file' type='file'
					   onChange={importEmployeeData} />
				</Button>
			    </form>
			</Col>
			<Col>
			    <Button className='data_btn' color='success' size='sm'
				    onClick={exportEmployeeData}>
				職員データのエクスポート
			    </Button>
			</Col>
			<Col>
			    <u><b>＊操作方法</b></u>
			    <ul>
				<li>すでに過去に作った職員データが有る場合はそちらを使ってください。</li>
				<li>「ファイルを選択」というボタンを押して、職員データをインポートしてください。</li>
				<li>ある程度編集できたら、「職員データのエクスポート」ボタンから、データをダウンロードして保存しておいてください。</li>
				<li>「職能」欄は、チェックが入っていれば、その業務を担えるという意味です。</li>
			    </ul>
			</Col>
		    </Row>
		</Col>
	    </Row>
	</Container>
    )
}

export default EmployeeEdit;
