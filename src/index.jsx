import React from 'react';
import ReactDOM from 'react-dom/client';
import Env from './Env';
import { Container, Col, Row, Button } from 'reactstrap';
import {
    BrowserRouter as Router,
    useRoutes,
} from "react-router-dom";

import Menubar from './Menubar/Menubar';


import Dashboard from './Components/Dashboard/Dashboard';
import ShiftRequestMake from './Components/ShiftRequestMake/ShiftRequestMake';
import EmployeeEdit from './Components/EmployeeEdit/EmployeeEdit';
import DataGathering from './Components/DataGathering/DataGathering';

import ShiftData from './Logic/Data/ShiftData.json';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';



const Home = (props) => {
    return (
	<>
	    <Row>　</Row>
	    <Row>
		<Col>
		    <h2>職員用</h2>
		    <a href={Env.urlRoute('shift-request-make')}>
			<Button color='success'>
			    休日希望の作成
			</Button>
		    </a>
		</Col>
		<Col>
		    <Row>
			<h2>シフト作成者用</h2>
			<Col>
			    <a href={Env.urlRoute('employee-edit')}>
				<Button color='primary'>
				    職員データの作成
				</Button>
			    </a>{'　'}
			</Col>
			<Col>
			    <a href={Env.urlRoute('data-gathering')}>
				<Button color='primary'>
				    休日希望の統合
				</Button>
			    </a>{'　'}
			</Col>
			<Col>
			    <a href={Env.urlRoute('dashboard')}>
				<Button color='primary'>
				    シフト案作成
				</Button>
			    </a>
			</Col>
		    </Row>
		</Col>
	    </Row>
	</>
    );
}

const ShiftDataJSON = () => {
    return JSON.stringify(ShiftData);
}



const ShiftCreatorRoutes = () => {
    return useRoutes([
	{ path: Env.urlRoute(""), element: <Home /> },
	{ path: Env.urlRoute("dashboard"), element: <Dashboard /> },
	{ path: Env.urlRoute("employee-edit"), element: <EmployeeEdit /> },
	{ path: Env.urlRoute("data-gathering"), element: <DataGathering /> },
	
	{ path: Env.urlRoute("shift-request-make"), element: <ShiftRequestMake /> },
	{ path: Env.urlRoute("shift-data"), element: <ShiftDataJSON /> },
    ]);
}

const ShiftCreator = () => {
    return (
	<div id="shift_creator">
	    <Container className=".container-fluid">
		<Col>
		    <Row>
			<Menubar/ >
		    </Row>
		    <Row>
			<Router>
			    <ShiftCreatorRoutes />
			</Router>
		    </Row>
		</Col>
	    </Container>
	</div>
    );
}

const rootContainer = ReactDOM.createRoot(document.getElementById('root'));
rootContainer.render(<ShiftCreator />);
