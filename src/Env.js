if (typeof Env === "undefined"){
    var Env = {};
}

Env.getEnv = (param) => {
    const env = {
	    "applicationRoot": "/",
	    //"applicationRoot": "/shift-creator/",
	    //"APIServerAddress": "http://localhost:8000",
    };
    return env[param];
}

Env.urlRoute = (page) => {
    return Env.getEnv('applicationRoot') + page;
}

Env.getParam = (rawUrl, paramName) => {
    let params = {};
    const rawParams = rawUrl.substr(rawUrl.indexOf('?')+1);
    rawParams.split('&').forEach( param => {
	    const temp = param.split('=');
	    params = {
	        ...params,
	        [temp[0]]: temp[1]
	    };
    });
    return params[paramName];
}

Env.getParamFromCurrentUrl = (paramName) => {
    var params = {};
    var search = window.location.search.substr(1);
    if (search === '') {
	    return params;
    }
    search.split('&').forEach(str => {
	    var arr = str.split('=');
	    if (arr[0] !== '') {
	        params[arr[0]] = arr[1] !== undefined ? decodeURIComponent(arr[1]) : '';
	    }
    });
    return params;
}

export default Env;
