import {format} from 'date-fns';

// 便利関数群置き場
export default class SelfUtilities {
    static exportJsonFile(data, filename_postfix) {
	    // シフトデータのエクスポート
	    const json = JSON.stringify(data);
	    const blob = new Blob([json], { type: 'application/json' });
	    const link_dom = document.createElement("a");
	    const url =  URL.createObjectURL(blob);
	    link_dom.href = url;
	    link_dom.download = format(new Date(), 'yyyyMMdd')+'-'+filename_postfix+'.json';
	    link_dom.click();
	    link_dom.remove();
    }
}
