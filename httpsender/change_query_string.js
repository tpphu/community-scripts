// The sendingRequest and responseReceived functions will be called for all requests/responses sent/received by ZAP, 
// including automated tools (e.g. active scanner, fuzzer, ...)

// Note that new HttpSender scripts will initially be disabled
// Right click the script in the Scripts tree and select "enable"  

// 'initiator' is the component the initiated the request:
// 		1	PROXY_INITIATOR
// 		2	ACTIVE_SCANNER_INITIATOR
// 		3	SPIDER_INITIATOR
// 		4	FUZZER_INITIATOR
// 		5	AUTHENTICATION_INITIATOR
// 		6	MANUAL_REQUEST_INITIATOR
// 		7	CHECK_FOR_UPDATES_INITIATOR
// 		8	BEAN_SHELL_INITIATOR
// 		9	ACCESS_CONTROL_SCANNER_INITIATOR
// 		10	AJAX_SPIDER_INITIATOR
// For the latest list of values see the HttpSender class:
// https://github.com/zaproxy/zaproxy/blob/main/zap/src/main/java/org/parosproxy/paros/network/HttpSender.java
// 'helper' just has one method at the moment: helper.getHttpSender() which returns the HttpSender 
// instance used to send the request.
//
// New requests can be made like this:
// msg2 = msg.cloneAll() // msg2 can then be safely changed as required without affecting msg
// helper.getHttpSender().sendAndReceive(msg2, false);
// print('msg2 response=' + msg2.getResponseHeader().getStatusCode())
var Hasher = Java.type("org.zaproxy.addon.encoder.processors.predefined.HashProcessor");

function sendingRequest(msg, initiator, helper) {
	// Debugging can be done using println like this
	var uri = msg.getRequestHeader().getURI().toString();
    var queryString = uri.split('?')[1]; // Lấy phần query string của URL
    var queryParams = parseQueryString(queryString); // Phân tích và lấy danh sách tham số
    
    
    print(JSON.stringify(queryParams));

    var secret = "86bc21d0eb73ff06be46d078e8dbe2db"
    var hashString = [
        queryParams.terminalCode,
        queryParams.merchantCode,
        queryParams.paymentRequestId ? queryParams.paymentRequestId : "",
        queryParams.orderCode ? queryParams.orderCode : "",
        ].join("|")
    hashString= secret+hashString
    var checksum = new Hasher("sha256").process(hashString).getResult();

    print("checksum: " + checksum);


    // Kiểm tra xem URI có chứa tham số cần thay đổi không
    print("Begin 1")
    if (uri.indexOf("checksum_replace") > 0) {
        var newUri = msg.getRequestHeader().getURI().getQuery().replace("checksum_replace", checksum);
        print("Begin 2 newUri: ", newUri)
        msg.getRequestHeader().getURI().setQuery(newUri);
    }

    return true;
}

function parseQueryString(queryString) {
    var params = {};
    // Phân chia chuỗi query string thành các cặp key-value
    var queries = queryString.split("&");
    queries.forEach(function(query) {
        var pair = query.split('=');
        if (pair[0] && pair[1]) {
            params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1].replace(/\+/g, " "));
        }
    });
    return params;
}

function replaceQueryParam(uri, paramName, newValue) {
    var re = new RegExp("([?&])" + paramName + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + paramName + "=" + newValue + '$2');
    }
    else {
        return uri + separator + paramName + "=" + newValue;
    }
}

function responseReceived(msg, initiator, helper) {
	// Debugging can be done using println like this
	print('responseReceived called for url=' + msg.getRequestHeader().getURI().toString())
}