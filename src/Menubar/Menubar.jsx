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
	    <NavbarBrand href={Env.urlRoute("")}>シフト管理システム</NavbarBrand>
	    <Nav id="menuItemList" end="true">
		<Dropdown nav isOpen={dropdownOpen} toggle={toggle} className="menuItem">
		    <DropdownToggle nav caret>
			観点別ビュー
		    </DropdownToggle>
		    <DropdownMenu>
			<DropdownItem className="viewItem"><NavLink href="#">１日ビュー</NavLink></DropdownItem>
			<DropdownItem className="viewItem"><NavLink href="#">１週間ビュー</NavLink></DropdownItem>
			<DropdownItem className="viewItem"><NavLink href="#">１ヶ月ビュー</NavLink></DropdownItem>
			<DropdownItem divider />
			<DropdownItem className="viewItem"><NavLink href="#">職員毎ビュー</NavLink></DropdownItem>
		    </DropdownMenu>
		</Dropdown>
	    </Nav>
	</Navbar>
    );
}

export default Menubar;
