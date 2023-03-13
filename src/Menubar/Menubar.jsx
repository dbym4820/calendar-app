import React, {useState} from 'react';
import Env from '../Env';
import {
    Navbar,
    NavbarBrand,
    Nav,
    NavItem,
    Dropdown,
    DropdownItem,
    DropdownToggle,
    DropdownMenu,
    NavLink,
} from 'reactstrap';


import './menubar.css'

const Menubar = (props) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const toggle = () => setDropdownOpen(!dropdownOpen);

    return (
	<Navbar id="global_menubar" color="secondary" dark {...props}>
	    <NavbarBrand href="">シフト管理システム</NavbarBrand>
	    <Nav id="menuItemList" end="true">
		<Dropdown nav isOpen={dropdownOpen} toggle={toggle} className="menuItem">
		    <DropdownToggle nav caret>
			ページ
		    </DropdownToggle>
		    <DropdownMenu>
			<DropdownItem header>職員用</DropdownItem>
			<DropdownItem className="viewItem"><NavLink href="shift-request-make">休日希望作成</NavLink></DropdownItem>
			<DropdownItem divider />
			<DropdownItem header>シフト作成者用</DropdownItem>
			<DropdownItem className="viewItem"><NavLink href="employee-edit">職員データ作成</NavLink></DropdownItem>
			<DropdownItem className="viewItem"><NavLink href="data-gathering">休日希望データの統合</NavLink></DropdownItem>
			<DropdownItem className="viewItem"><NavLink href="dashboard">シフト作成</NavLink></DropdownItem>
		    </DropdownMenu>
		</Dropdown>
	    </Nav>
	</Navbar>
    );
}

export default Menubar;
