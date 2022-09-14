import React, { useCallback, useState, useEffect } from "react";
import Env from '../../Env';
import { Button, Input } from 'reactstrap';


const ImportButton = ({label, handleImportFile}) => {
    // ファイルを入力するためのフォーム付きボタン
    return (
	<form>
	    <Button color='primary' size='sm'>
		<label>{label}</label><br />
		<Input type='file'
		       onChange={handleImportFile}/>
	    </Button>
	</form>
    );
};

export default ImportButton;
