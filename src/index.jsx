import React from 'react';
import ReactDOM from 'react-dom/client';
import Env from './Env';
import { Container, Col, Row } from 'reactstrap';
import {
    BrowserRouter as Router,
    useRoutes,
} from "react-router-dom";

import Menubar from './Menubar/Menubar';
import Dashboard from './Components/Dashboard/Dashboard';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const ShiftCreatorRoutes = () => {
    return useRoutes([
	{ path: Env.urlRoute(""), element: <Dashboard /> },
	{ path: Env.urlRoute("/a"), element: <Dashboard /> },
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
